function getJwtCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}
let currentPage = 1;
const limit = 10; // Number of tasks per page
let totalPages;
const fetchUserTasks = async (filters = {}) => {
  const status = filters.status || "";
  const priority = filters.priority || "";

  try {
    const token = getJwtCookie("jwt_user");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/task/taskbyuser?page=${currentPage}&limit=${limit}&status=${status}&priority=${priority}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch tasks");
    }

    const data = await response.json();
    displayTasks(data.tasks);
    totalPages = data.totalPages;
    handlePagination(data.totalPages);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    document.getElementById(
      "task-container"
    ).innerHTML = `<p>${error.message}</p>`;
  }
};

const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const token = getJwtCookie("jwt_user");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/task/${taskId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update task status");
    }

    console.log(`Task ${taskId} status updated to ${newStatus}`);
  } catch (error) {
    console.error(`Error updating status for task ${taskId}:`, error.message);
    alert(`Failed to update status: ${error.message}`);
  }
};

const displayTasks = (tasks) => {
  const taskTableBody = document.querySelector("#task-table tbody");
  taskTableBody.innerHTML = ""; // Clear existing rows

  if (!tasks || tasks.length === 0) {
    taskTableBody.innerHTML = `
      <tr>
        <td colspan="6">No tasks available</td>
      </tr>
    `;
    return;
  }

  tasks.forEach((task) => {
    const row = document.createElement("tr");
    const dueDate = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString()
      : "No Due Date";
    const createdAt = new Date(task.createdAt).toLocaleString();
    const priorityClass = `priority-${task.priority.toLowerCase()}`;

    row.innerHTML = `
      <td>${createdAt}</td>
      <td>${task.title}</td>
      <td>${task.description || "N/A"}</td>
      <td class="${priorityClass}">${
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    }</td>
      <td>${dueDate}</td>
      <td>
        <select class="task-status" data-task-id="${task.id}">
          <option value="open" ${
            task.status === "open" ? "selected" : ""
          }>Open</option>
          <option value="inprogress" ${
            task.status === "inprogress" ? "selected" : ""
          }>In Progress</option>
          <option value="rejected" ${
            task.status === "rejected" ? "selected" : ""
          }>Rejected</option>
          <option value="completed" ${
            task.status === "completed" ? "selected" : ""
          }>Completed</option>
        </select>
      </td>
    `;

    taskTableBody.appendChild(row);
  });

  document.getElementById("status-filter").addEventListener("change", () => {
    const filters = getFilters();
    fetchUserTasks(filters);
  });

  document.getElementById("priority-filter").addEventListener("change", () => {
    const filters = getFilters();
    fetchUserTasks(filters);
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchUserTasks(getFilters());
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchUserTasks(getFilters());
    }
  });

  const getFilters = () => {
    const status = document.getElementById("status-filter").value;
    const priority = document.getElementById("priority-filter").value;
    return { status, priority };
  };

  document.querySelectorAll(".task-status").forEach((dropdown) => {
    dropdown.addEventListener("change", (event) => {
      const taskId = event.target.dataset.taskId;
      const newStatus = event.target.value;
      updateTaskStatus(taskId, newStatus);
    });
  });
};

const handlePagination = (totalPages) => {
  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
  document.getElementById("current-page").textContent = `Page ${currentPage}`;
};

fetchUserTasks();

const logout = async () => {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/v1/users/logout", {
      method: "POST",
    });

    if (res.status === 200) window.location.href = "/index.html";
  } catch (err) {
    console.log(err.response);
    console.log(err.message);
  }
};

const logoutbtn = document.querySelector(".btn-logout");
if (logoutbtn) {
  logoutbtn.addEventListener("click", logout);
}
