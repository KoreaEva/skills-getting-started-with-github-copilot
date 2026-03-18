document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsItems = details.participants.map((participant) => `
          <li>
            <span class="participant-email">${participant}</span>
            <button type="button" class="remove-participant" data-activity="${name}" data-email="${participant}" title="Remove participant">🗑️</button>
          </li>
        `).join("");

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
            <ul class="participants-list">
              ${participantsItems || '<li><em>No one registered yet.</em></li>'}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Attach delete handlers for each participant
        activityCard.querySelectorAll('.remove-participant').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const activityName = btn.getAttribute('data-activity');
            const email = btn.getAttribute('data-email');

            try {
              const deleteResponse = await fetch(
                `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );

              const deleteResult = await deleteResponse.json();

              if (deleteResponse.ok) {
                messageDiv.textContent = deleteResult.message;
                messageDiv.className = 'success';
                fetchActivities();
              } else {
                messageDiv.textContent = deleteResult.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
              }

              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 5000);
            } catch (error) {
              messageDiv.textContent = 'Failed to remove participant. Please try again.';
              messageDiv.className = 'error';
              messageDiv.classList.remove('hidden');
              console.error('Error removing participant:', error);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
