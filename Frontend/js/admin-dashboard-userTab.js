const userTab = () => {
  const userSection = document.querySelector(
    ".sidebar-item[data-section='users']"
  );
  const mainContent = document.getElementById("mainContent");

  const renderTabs = () => {
    mainContent.innerHTML = `
      <div class="users">
        <button class="tab-btn active" id="createUserTab">Create User</button>
        <button class="tab-btn" id="manageUserTab">Manage Users</button>
      </div>
      <div id="tabContent">
        <!-- Dynamic content will be inserted here -->
      </div>
    `;

    tabEvent();
  };

  const tabEvent = () => {
    const createUserTab = document.getElementById("createUserTab");
    const manageUserTab = document.getElementById("manageUserTab");

    createUserTab.addEventListener("click", () => {
      createUserTab.classList.add("active");
      manageUserTab.classList.remove("active");
      renderUserForm();
    });

    manageUserTab.addEventListener("click", () => {
      manageUserTab.classList.add("active");
      createUserTab.classList.remove("active");
      renderManageUsersView();
    });
  };

  const renderUserForm = () => {
    const tabContent = document.getElementById("tabContent");
    tabContent.innerHTML = `
      <div class="form-container">
        <h1 class="form-h1">Create User</h1>

        <form id="userForm">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required minlength="8" maxlength="20" placeholder="Enter User Name" />

          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="Enter User Email"/>

          <label for="number">Contact Number</label>
          <input id="number" name="number" type="tel" required placeholder="Enter Contact Number"  />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" required minlength="8" placeholder="Enter Your Password" />

          <label for="passwordConfirm">Confirm Password</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" required placeholder="Confirm Your Password" />

          <button class="btn-create" type="submit">Create User</button>
        </form>
        <div id="responseMessage"></div>
      </div>
    `;

    document
      .getElementById("userForm")
      .addEventListener("submit", handleUserFormSubmission);
  };

  const renderManageUsersView = async () => {
    const tabContent = document.getElementById("tabContent");
    tabContent.innerHTML = `
      <div class="manage-users">
        <h2>Manage Users</h2>
        <table id="usersTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div id="errorMessage"></div>
      </div>
    `;

    await getAllUsers();
  };

  const getAllUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users");

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const users = data.data.users;
      const tableBody = document.querySelector("#usersTable tbody");

      tableBody.innerHTML = "";

      if (users.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='2'>No users found</td></tr>";
        return;
      }

      users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
      document.getElementById("errorMessage").innerText =
        "Failed to load users. Please try again later.";
    }
  };

  const validateFormData = () => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("number").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    return { name, email, phone: Number(phone), password, passwordConfirm };
  };

  const showErrorMessage = (message) => {
    const responseMessage = document.getElementById("responseMessage");
    responseMessage.innerText = `Error: ${message}`;
    responseMessage.style.color = "red";
  };

  const handleUserFormSubmission = async (e) => {
    e.preventDefault();

    const formData = validateFormData();
    if (!formData) return;

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        document.getElementById("responseMessage").innerText =
          "User created successfully!";
        document.getElementById("responseMessage").style.color = "green";
        document.getElementById("userForm").reset();
        renderManageUsersView();
      } else {
        const error = await response.json();
        showErrorMessage(error.message);
      }
    } catch (err) {
      showErrorMessage("An unexpected error occurred.");
      console.error(err.message);
    }
  };

  if (userSection) {
    userSection.addEventListener("click", renderTabs);
  }
};

userTab();
