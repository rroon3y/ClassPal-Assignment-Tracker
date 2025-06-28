// Fetch assignments from json-server on load
let assignments = [];

fetch('http://localhost:3000/assignments')
  .then(response => response.json())
  .then(data => {
    assignments = data;
    displayAssignments();
  })
  .catch(error => {
    console.error('Error fetching assignments:', error);
    // Fallback to localStorage if fetch fails
    const savedAssignments = localStorage.getItem("assignments");
    if (savedAssignments) {
      assignments = JSON.parse(savedAssignments);
      displayAssignments();
    }
  });

// Form elements
const form = document.getElementById("assignment-form");
const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const assignmentList = document.getElementById("assignment-list");

// Form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const assignment = {
    id: Date.now(),
    title: titleInput.value,
    subject: subjectInput.value,
    dueDate: dueDateInput.value,
    priority: priorityInput.value,
    completed: false
  };

  // Add to server
  fetch('http://localhost:3000/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignment)
  })
    .then(response => response.json())
    .then(newAssignment => {
      assignments.push(newAssignment);
      displayAssignments();
      form.reset();
    })
    .catch(error => {
      console.error('Error adding assignment:', error);
      // Fallback: add locally if server fails
      assignments.push(assignment);
      displayAssignments();
      form.reset();
    });
});

// Display assignments
function displayAssignments() {
  assignmentList.innerHTML = "";

  assignments.forEach((assignment) => {
    const assignmentDiv = document.createElement("div");
    assignmentDiv.classList.add("assignment");
    if (assignment.completed) {
      assignmentDiv.classList.add("completed");
    }

    assignmentDiv.innerHTML = `
      <div class="assignment-info">
        <h3>${assignment.title}</h3>
        <p><strong>Subject:</strong> ${assignment.subject}</p>
        <p><strong>Due:</strong> ${assignment.dueDate}</p>
        <p><strong>Priority:</strong> ${assignment.priority}</p>
      </div>
      <div class="assignment-actions">
        <button class="done-btn">${assignment.completed ? "↩️ Undo" : "✅ Done"}</button>
        <button class="delete-btn">🗑️ Delete</button>
      </div>
    `;

    // Done button event
    assignmentDiv.querySelector(".done-btn").addEventListener("click", () => {
      markCompleted(assignment.id, assignment.completed);
    });

    // Delete button event
    assignmentDiv.querySelector(".delete-btn").addEventListener("click", () => {
      deleteAssignment(assignment.id);
    });

    assignmentList.appendChild(assignmentDiv);
  });

  // Save to localStorage as backup
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

// Mark as completed
function markCompleted(id, currentStatus) {
  // Update on server
  fetch(`http://localhost:3000/assignments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !currentStatus })
  })
    .then(response => response.json())
    .then(updatedAssignment => {
      assignments = assignments.map(a =>
        a.id === id ? updatedAssignment : a
      );
      displayAssignments();
    })
    .catch(error => {
      // Fallback: update locally if server fails
      assignments = assignments.map(a =>
        a.id === id ? { ...a, completed: !a.completed } : a
      );
      displayAssignments();
    });
}

function deleteAssignment(id) {
  // Delete from server
  fetch(`http://localhost:3000/assignments/${id}`, {
    method: 'DELETE'
  })
    .then(() => {
      assignments = assignments.filter(a => a.id !== id);
      displayAssignments();
    })
    .catch(error => {
      // Fallback: delete locally if server fails
      assignments = assignments.filter(a => a.id !== id);
      displayAssignments();
    });
}

// Timer functionality
setInterval(() => {
  const now = new Date();
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = "Timer: " + now.toLocaleTimeString();
  }
}, 1000);