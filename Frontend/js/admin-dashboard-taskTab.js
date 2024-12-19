const getJwtCookie = (name) => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};
const taskSection = document.querySelector(
  ".sidebar-item[data-section='tasks']"
);
const mainContent = document.getElementById("mainContent");

const addTaskEventListeners = () => {
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const updateButtons = document.querySelectorAll(".update-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const taskId = event.target
        .closest(".delete-btn")
        .getAttribute("data-task-id");
      deleteTask(taskId);
    });
  });

  updateButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const taskId = event.target
        .closest(".update-btn")
        .getAttribute("data-task-id");
      updateTask(taskId);
    });
  });
};

function renderTabs() {
  mainContent.innerHTML = `
        <div class="tabs">
          <button class="tab-btn active" id="createTaskTab">Create Task</button>
          <button class="tab-btn" id="manageTaskTab">Manage Task</button>
        </div>
        <div id="tabContent">
          <!-- Inside content -->
        </div>
      `;

  const createTaskTab = document.getElementById("createTaskTab");
  const manageTaskTab = document.getElementById("manageTaskTab");
  const tabContent = document.getElementById("tabContent");

  createTaskTab.addEventListener("click", () => {
    createTaskTab.classList.add("active");
    manageTaskTab.classList.remove("active");

    tabContent.innerHTML = `
          <div class="form-container">
            <h1 class="form-h1">Create Task</h1>
            <form id="taskForm">
              <!-- Hidden input for user role -->
              <input type="hidden" id="userRole" value="admin" />

              <label for="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minlength="10"
                maxlength="40"
                placeholder="Enter task title"
              />

              <label for="description">Description:</label>
              <textarea
                id="description"
                name="description"
                required
                placeholder="Enter task description"
              ></textarea>

              <label for="priority">Priority:</label>
              <select id="priority" name="priority" required>
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label for="dueDate">Due Date:</label>
              <input type="date" id="dueDate" name="dueDate" required min="${
                new Date().toISOString().split("T")[0]
              }"/>

              <label for="assignee">Assignee:</label>
              <select id="assignee" name="assignee">
                <option value="">Select Assignee</option>
              </select>

              <button class="btn-create" id="btn-create"type="submit">Create Task</button>
             <div class="loader-overlay" id="loader">
                       <div class="loader"></div>
            </div>

            </form>
            <div id="responseMessage"></div>
          </div>
        `;

    populateAssigneeDropdown();
    getTask();

    document
      .getElementById("taskForm")
      .addEventListener("submit", handleTaskSubmission);
  });

  manageTaskTab.addEventListener("click", () => {
    manageTaskTab.classList.add("active");
    createTaskTab.classList.remove("active");

    tabContent.innerHTML = `
        <div class="container">
          <input type="hidden" id="userRole" value="admin" />
          
          <!-- Update Task Form -->
          <div id="updateTaskContainer" style="display: none">
            <form id="updateForm">
              <h2>Update Task</h2>
              <label class="update-label" for="title">Title:</label>
              <input
                class="update-input"
                type="text"
                id="title"
                name="title"
                required
              />
              <br />

              <label class="update-label" for="description">Description:</label>
              <textarea
                class="update-input"
                id="description"
                name="description"
                required
              ></textarea>
              <br />

              <label class="update-label" for="priority">Priority:</label>
              <select class="update-input" id="priority" name="priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <br />

              <label class="update-label" for="dueDate">Due Date:</label>
              <input
                class="update-input"
                type="date"
                id="dueDate"
                name="dueDate"
                required
                min="${new Date().toISOString().split("T")[0]}"
              />
              <br />

              <select id="assignee" name="assignee">
                <option value="">Select Assignee</option>
              </select>
              <br />

              <button class="update-button" type="submit">Update Task</button>
              <button class="cancel-button" type="button" id="cancelUpdateBtn">
                Cancel
              </button>
            </form>
          </div>

          <div>
            <div id="taskContainer">
              <p id="errorMessage" class="error"></p>
            </div>
          </div>
        </div>
        `;
    populateAssigneeDropdown();
    getTask();
  });
}

const getTask = async () => {
  try {
    const token = getJwtCookie("jwt_admin");

    const response = await fetch(
      "http://127.0.0.1:3000/api/v1/task/taskbyadmin",
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
      throw new Error(`${response.statusText}`);
    }

    const data = await response.json();
    // console.log(data);
    const tasks = data.data.tasks;
    const taskContainer = document.getElementById("taskContainer");
    const errorMessage = document.getElementById("errorMessage");
    if (taskContainer) taskContainer.innerHTML = "";
    if (errorMessage) errorMessage.textContent = "";

    if (tasks.length === 0) {
      if (taskContainer) {
        taskContainer.innerHTML = "<p>No tasks available.</p>";
      }
      return;
    }

    const table = document.createElement("table");
    table.className = "tasks-table";
    table.innerHTML = `
          <thead>
            <tr>
              <th>Assigned Date</th>
              <th>Title</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="tasksTableBody"></tbody>
        `;

    const tableBody = table.querySelector("#tasksTableBody");

    tasks.forEach((task) => {
      const row = document.createElement("tr");
      const dueDate = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : "No Due Date";
      const createdAt = new Date(task.createdAt).toLocaleString();
      const priorityClass = `priority-${task.priority.toLowerCase()}`;
      const statusClass = `status-${task.status.toLowerCase()}`;

      row.innerHTML = `
            <td>${createdAt}</td>
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.assignee ? task.assignee.name : "No assignee"}</td>
            <td class=${priorityClass}>${
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
      }</td>
            <td>${dueDate}</td>
            <td class=${statusClass}>${
        task.status.charAt(0).toUpperCase() + task.status.slice(1)
      }</td>

            <td>
              <div class="action-buttons">
                <button type="button" class="delete-btn" data-task-id="${
                  task._id
                }">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 100 100">
                  <path fill="#f37e98" d="M25,30l3.645,47.383C28.845,79.988,31.017,82,33.63,82h32.74c2.613,0,4.785-2.012,4.985-4.617L75,30"></path><path fill="#f15b6c" d="M65 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S65 36.35 65 38zM53 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S53 36.35 53 38zM41 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S41 36.35 41 38zM77 24h-4l-1.835-3.058C70.442 19.737 69.14 19 67.735 19h-35.47c-1.405 0-2.707.737-3.43 1.942L27 24h-4c-1.657 0-3 1.343-3 3s1.343 3 3 3h54c1.657 0 3-1.343 3-3S78.657 24 77 24z"></path><path fill="#1f212b" d="M66.37 83H33.63c-3.116 0-5.744-2.434-5.982-5.54l-3.645-47.383 1.994-.154 3.645 47.384C29.801 79.378 31.553 81 33.63 81H66.37c2.077 0 3.829-1.622 3.988-3.692l3.645-47.385 1.994.154-3.645 47.384C72.113 80.566 69.485 83 66.37 83zM56 20c-.552 0-1-.447-1-1v-3c0-.552-.449-1-1-1h-8c-.551 0-1 .448-1 1v3c0 .553-.448 1-1 1s-1-.447-1-1v-3c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v3C57 19.553 56.552 20 56 20z"></path><path fill="#1f212b" d="M77,31H23c-2.206,0-4-1.794-4-4s1.794-4,4-4h3.434l1.543-2.572C28.875,18.931,30.518,18,32.265,18h35.471c1.747,0,3.389,0.931,4.287,2.428L73.566,23H77c2.206,0,4,1.794,4,4S79.206,31,77,31z M23,25c-1.103,0-2,0.897-2,2s0.897,2,2,2h54c1.103,0,2-0.897,2-2s-0.897-2-2-2h-4c-0.351,0-0.677-0.185-0.857-0.485l-1.835-3.058C69.769,20.559,68.783,20,67.735,20H32.265c-1.048,0-2.033,0.559-2.572,1.457l-1.835,3.058C27.677,24.815,27.351,25,27,25H23z"></path><path fill="#1f212b" d="M61.5 25h-36c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h36c.276 0 .5.224.5.5S61.776 25 61.5 25zM73.5 25h-5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h5c.276 0 .5.224.5.5S73.776 25 73.5 25zM66.5 25h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c.276 0 .5.224.5.5S66.776 25 66.5 25zM50 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v25.5c0 .276-.224.5-.5.5S52 63.776 52 63.5V38c0-1.103-.897-2-2-2s-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2v-3.5c0-.276.224-.5.5-.5s.5.224.5.5V73C53 74.654 51.654 76 50 76zM62 76c-1.654 0-3-1.346-3-3V47.5c0-.276.224-.5.5-.5s.5.224.5.5V73c0 1.103.897 2 2 2s2-.897 2-2V38c0-1.103-.897-2-2-2s-2 .897-2 2v1.5c0 .276-.224.5-.5.5S59 39.776 59 39.5V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C65 74.654 63.654 76 62 76z"></path><path fill="#1f212b" d="M59.5 45c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v2C60 44.776 59.776 45 59.5 45zM38 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C41 74.654 39.654 76 38 76zM38 36c-1.103 0-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2V38C40 36.897 39.103 36 38 36z"></path>
                  </svg>
                </button>
                <button type="button" class="update-btn" data-task-id="${
                  task._id
                }">
                    <svg height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#F2EFE2;" d="M503.724,199.411c0-30.236-23.835-55.008-53.703-56.516V51.2c0-23.812-19.304-43.116-43.116-43.116 H105.095c-23.812,0-43.116,19.304-43.116,43.116v221.05c-29.866,1.509-53.703,26.273-53.703,56.508 c0,30.236,23.835,55.008,53.703,56.516V460.8c0,23.812,19.304,43.116,43.116,43.116h301.811c23.812,0,43.116-19.304,43.116-43.116 V255.918C479.887,254.409,503.724,229.645,503.724,199.411z M24.444,328.758c0-21.316,16.59-38.817,37.534-40.304v80.61 C41.034,367.578,24.444,350.074,24.444,328.758z M450.021,239.714v-80.61c20.946,1.486,37.534,18.989,37.534,40.307 C487.555,220.727,470.966,238.228,450.021,239.714z"></path> <path style="fill:#BFBBA3;" d="M97.011,142.821c0-4.465,3.62-8.084,8.084-8.084h97.011c4.465,0,8.084,3.62,8.084,8.084 c0,4.465-3.62,8.084-8.084,8.084h-97.011C100.63,150.905,97.011,147.286,97.011,142.821z M406.905,361.095h-97.011 c-4.465,0-8.084,3.62-8.084,8.084s3.62,8.084,8.084,8.084h97.011c4.465,0,8.084-3.62,8.084-8.084S411.37,361.095,406.905,361.095z M212.884,285.642H105.095c-4.465,0-8.084,3.62-8.084,8.084c0,4.465,3.62,8.084,8.084,8.084h107.789c4.465,0,8.084-3.62,8.084-8.084 C220.968,289.262,217.349,285.642,212.884,285.642z M406.905,285.642h-97.011c-4.465,0-8.084,3.62-8.084,8.084 c0,4.465,3.62,8.084,8.084,8.084h97.011c4.465,0,8.084-3.62,8.084-8.084C414.989,289.262,411.37,285.642,406.905,285.642z M204.8,218.274c0,4.465,3.62,8.084,8.084,8.084h194.021c4.465,0,8.084-3.62,8.084-8.084c0-4.465-3.62-8.084-8.084-8.084H212.884 C208.42,210.189,204.8,213.809,204.8,218.274z M105.095,226.358h43.116c4.465,0,8.084-3.62,8.084-8.084 c0-4.465-3.62-8.084-8.084-8.084h-43.116c-4.465,0-8.084,3.62-8.084,8.084C97.011,222.738,100.63,226.358,105.095,226.358z M179.469,210.189c-4.465,0-8.084,3.62-8.084,8.084c0,4.465,3.62,8.084,8.084,8.084h1.078c4.465,0,8.084-3.62,8.084-8.084 c0-4.465-3.62-8.084-8.084-8.084H179.469z M246.299,285.642h-1.078c-4.465,0-8.084,3.62-8.084,8.084c0,4.465,3.62,8.084,8.084,8.084 h1.078c4.465,0,8.084-3.62,8.084-8.084C254.383,289.262,250.764,285.642,246.299,285.642z M277.558,285.642h-1.078 c-4.465,0-8.084,3.62-8.084,8.084c0,4.465,3.62,8.084,8.084,8.084h1.078c4.465,0,8.084-3.62,8.084-8.084 C285.642,289.262,282.023,285.642,277.558,285.642z"></path> <path style="fill:#FC8059;" d="M263.622,375.194l-41.92,33.082c-2.105,1.661-5.518,1.661-7.622,0 c-1.011-0.798-1.578-1.88-1.578-3.007v-19.921H70.255h-5.389c-31.204,0-56.589-25.385-56.589-56.589 c0-30.3,23.938-55.11,53.895-56.522v16.2c-21.036,1.393-37.726,18.94-37.726,40.321c0,22.289,18.132,40.421,40.421,40.421h5.389 h142.247v-36.089c0-1.127,0.568-2.21,1.578-3.007c2.105-1.661,5.518-1.661,7.622,0l41.92,33.082 C267.831,366.486,267.831,371.871,263.622,375.194z M447.134,142.821h-5.389H299.116v-36.089c0-1.127-0.568-2.21-1.578-3.007 c-2.105-1.661-5.517-1.661-7.622,0l-41.92,33.082c-4.209,3.322-4.209,8.707,0,12.029l41.92,33.082c2.105,1.661,5.517,1.661,7.622,0 c1.011-0.798,1.578-1.88,1.578-3.007v-19.921h142.629h5.389c22.289,0,40.421,18.132,40.421,40.421 c0,21.382-16.69,38.928-37.726,40.321v16.2c29.957-1.412,53.895-26.221,53.895-56.522 C503.724,168.207,478.338,142.821,447.134,142.821z"></path> <path style="fill:#4C4C4C;" d="M457.913,134.792V51.2c0-28.231-22.969-51.2-51.2-51.2H104.903c-28.231,0-51.2,22.969-51.2,51.2 v212.956C23.834,265.664,0,290.438,0,320.674c0,31.204,25.385,56.589,56.589,56.589h147.636v28.004c0,3.609,1.696,7.018,4.652,9.353 c0.001,0,0.002,0.001,0.002,0.002c5.028,3.967,12.61,3.966,17.638,0l41.92-33.082c3.962-3.126,6.233-7.632,6.233-12.36 c0-4.729-2.271-9.234-6.232-12.361l-41.92-33.081c-5.028-3.969-12.611-3.968-17.639,0c-2.958,2.335-4.654,5.744-4.654,9.354v28.003 H69.871V51.2c0-19.316,15.716-35.032,35.032-35.032h301.811c19.317,0,35.032,15.716,35.032,35.032v83.537H307.008v-28.004 c0-3.611-1.697-7.021-4.657-9.355c-5.028-3.966-12.609-3.966-17.635,0.001l-41.92,33.082c-3.961,3.126-6.232,7.631-6.233,12.36 c0,4.729,2.271,9.234,6.233,12.361l41.919,33.08c5.028,3.97,12.612,3.969,17.634,0.003c2.961-2.334,4.659-5.744,4.659-9.356v-28.004 H455.41c22.289,0,40.421,18.132,40.421,40.421c0,21.447-16.791,39.048-37.918,40.345v-40.345c0-4.465-3.618-8.084-8.084-8.084 s-8.084,3.62-8.084,8.084V460.8c0,19.316-15.715,35.032-35.032,35.032H104.903c-19.316,0-35.032-15.716-35.032-35.032v-43.116 c0-4.465-3.62-8.084-8.084-8.084s-8.084,3.62-8.084,8.084V460.8c0,28.231,22.969,51.2,51.2,51.2h301.811 c28.231,0,51.2-22.969,51.2-51.2V247.861C487.961,246.548,512,221.692,512,191.326S487.961,136.105,457.913,134.792z M53.703,360.992c-20.947-1.484-37.534-19-37.534-40.319c0-21.319,16.588-38.834,37.534-40.319V360.992z M220.394,339.5 l37.609,29.679l-37.609,29.679L220.394,339.5L220.394,339.5z M290.84,172.499l-37.609-29.678l37.609-29.679V172.499z"></path> </g></svg>
                </button>
              </div>
            </td>
          `;

      tableBody.appendChild(row);
    });

    if (taskContainer) {
      taskContainer.appendChild(table);
    }

    addTaskEventListeners();
  } catch (error) {
    console.error(error);
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.textContent =
        "Failed to load tasks. Please try again later.";
    }
  }
};

const deleteTask = async (taskId) => {
  try {
    const deletedata = await fetch(
      `http://127.0.0.1:3000/api/v1/task/${taskId}`,
      { method: "DELETE" }
    );

    if (deletedata.status === 204) {
      // console.log("Task deleted successfully");
      alert("Task deleted successfully!");
      await getTask();
      return;
    }

    const result = await deletedata.json();
    console.log(result.message || "Task deleted");

    await getTask();
  } catch (error) {
    console.error("Failed to delete task:", error);
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.textContent = `Failed to delete task: ${error.message}`;
    }
  }
};

const updateTask = async (taskId) => {
  try {
    const updateTaskContainer = document.getElementById("updateTaskContainer");
    if (updateTaskContainer) {
      updateTaskContainer.style.display = "block";
    }

    const response = await fetch(`http://127.0.0.1:3000/api/v1/task/${taskId}`);
    const taskData = await response.json();

    if (!response.ok) {
      throw new Error(`Error fetching task data: ${taskData.message}`);
    }

    const task = taskData.data.task;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("priority").value = task.priority;
    document.getElementById("dueDate").value = new Date(task.dueDate)
      .toISOString()
      .split("T")[0];

    document.getElementById("assignee").value = task.assignee;

    const updateForm = document.getElementById("updateForm");
    updateForm.onsubmit = async (e) => {
      e.preventDefault();

      const formData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        dueDate: document.getElementById("dueDate").value,
        assignee: document.getElementById("assignee").value,
      };

      try {
        const updatedata = await fetch(
          `http://127.0.0.1:3000/api/v1/task/${taskId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const updateResult = await updatedata.json();

        if (!updatedata.ok) {
          const errorMessage = document.getElementById("errorMessage");
          if (errorMessage) {
            errorMessage.textContent = `Error updating task: ${updateResult.message}`;
          }
          throw new Error(`Error updating task: ${updateResult.message}`);
        }

        // console.log("Updated task response:", updateResult);
        // console.log("Task updated successfully!");

        if (updateTaskContainer) {
          updateTaskContainer.style.display = "none";
        }
        await getTask();
        alert("Task updated successfully!");
      } catch (error) {
        console.error("Failed to update task:", error.message);
        const errorMessage = document.getElementById("errorMessage");
        if (errorMessage) {
          errorMessage.textContent = `Failed to update task: ${error.message}`;
        }
      }
    };

    const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");
    if (cancelUpdateBtn) {
      cancelUpdateBtn.onclick = () => {
        if (updateTaskContainer) {
          updateTaskContainer.style.display = "none";
        }
      };
    }
  } catch (error) {
    console.error("Failed to prepare task update:", error);
    alert(`Failed to prepare task update: ${error.message}`);
  }
};
const populateAssigneeDropdown = async () => {
  try {
    const token = getJwtCookie("jwt_admin");
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/admin", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const data = await response.json();
    const users = data.data;
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
const handleTaskSubmission = async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate = document.getElementById("dueDate").value;
  const assignee = document.getElementById("assignee").value;
  const userRole = document.getElementById("userRole").value;
  const responseMessage = document.getElementById("responseMessage");
  const loaderOverlay = document.getElementById("loader");
  const formContainer = document.querySelector(".form-container");

  if (responseMessage) {
    responseMessage.innerText = "";
    responseMessage.style.color = "";
  }

  if (userRole !== "admin") {
    if (responseMessage) {
      responseMessage.innerText = "Only admins can create tasks.";
      responseMessage.style.color = "red";
    }
    return;
  }
  loaderOverlay.style.display = "flex";
  formContainer.style.filter = "blur(3px)";

  try {
    const formData = { title, description, priority, dueDate, assignee };

    const response = await fetch("http://127.0.0.1:3000/api/v1/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      responseMessage.innerText = "Task created successfully!";
      responseMessage.style.color = "green";
      document.getElementById("taskForm").reset();
    } else {
      const error = await response.json();
      responseMessage.innerText = `${error.message}`;
      responseMessage.style.color = "red";
    }
  } catch (err) {
    responseMessage.innerText = `${err.message}`;
    responseMessage.style.color = "red";
  } finally {
    loaderOverlay.style.display = "none";
    formContainer.style.filter = "none";
  }
};

if (taskSection) {
  taskSection.addEventListener("click", renderTabs);
}

const logout = async () => {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/v1/users/logout", {
      method: "POST",
      credentials: "include",
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
