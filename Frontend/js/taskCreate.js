document
  .getElementById("taskForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      priority: document.getElementById("priority").value,
      dueDate: document.getElementById("dueDate").value,
      assignee: document.getElementById("assignee").value,
    };
    const userRole = document.getElementById("userRole").value;

    if (userRole !== "admin") {
      document.getElementById("responseMessage").innerText =
        "Error: Only admins can create tasks.";
      document.getElementById("responseMessage").style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        document.getElementById("responseMessage").innerText =
          "Task created successfully!";
        document.getElementById("responseMessage").style.color = "green";
        document.getElementById("taskForm").reset(); // Clear the form
        window.location.href = "/dashboard.html";
      } else {
        const error = await response.json();
        document.getElementById(
          "responseMessage"
        ).innerText = `Error: ${error.message}`;
        document.getElementById("responseMessage").style.color = "red";
      }
    } catch (err) {
      document.getElementById(
        "responseMessage"
      ).innerText = `Error: ${err.message}`;
      document.getElementById("responseMessage").style.color = "red";
    }
  });

const assigneeDropdown = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    const users = data.data.users;
    // console.log(users);
    const assigneeDropdown = document.getElementById("assignee");

    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user._id;
      option.textContent = user.name;
      assigneeDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

assigneeDropdown();
