const userTab = () => {
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
  const userSection = document.querySelector(
    ".sidebar-item[data-section='users']"
  );
  const mainContent = document.getElementById("mainContent");

  const showLoader = () => {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
  };

  const hideLoader = () => {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
  };

  const renderTabs = () => {
    mainContent.innerHTML = `
      <div class="users">
        <button class="tab-btn active" id="createUserTab">Create User</button>
        <button class="tab-btn" id="manageUserTab">Manage Users</button>
      </div>
      <div id="tabContent">
        <!-- Dynamic content will be inserted here -->
      </div>
      <div class="loader-overlay" id="loader">
        <div class="loader"></div>
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

    manageUserTab.addEventListener("click", async () => {
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
        <div class="loader-overlay" id="loader">
          <div class="loader"></div>
        </div>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div id="errorMessage"></div>
        <div class="loader-overlay" id="loader">
          <div class="loader"></div>
        </div>
      </div>
    `;

    await getAllUsers();

    const usersTable = document.getElementById("usersTable");
    if (usersTable) {
      usersTable.addEventListener("click", (event) => {
        const unlinkButton = event.target.closest("button");
        if (unlinkButton) {
          const userRow = unlinkButton.closest("tr");
          if (userRow) {
            const userId =
              userRow.querySelector("td[data-user-id]").dataset.userId;
            unmapadmin(userId);
          }
        }
      });
    }
  };

  const getAllUsers = async () => {
    showLoader();
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
        throw new Error(`${response.statusText}`);
      }

      const data = await response.json();
      const users = data.data;
      const tableBody = document.querySelector("#usersTable tbody");

      tableBody.innerHTML = "";

      if (users.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='3'>No users found</td></tr>";
        return;
      }

      users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td data-user-id=${user._id}><button class="btn-unlink">unlink</button></td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
      document.getElementById("errorMessage").innerText =
        "Failed to load users. Please try again later.";
    } finally {
      hideLoader();
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
    if (responseMessage) {
      responseMessage.innerText = `${message}`;
      responseMessage.style.color = "red";
    }
  };

  const handleUserFormSubmission = async (e) => {
    e.preventDefault();
    showLoader();

    const formData = validateFormData();
    if (!formData) {
      hideLoader();
      return;
    }

    try {
      const token = getJwtCookie("jwt_admin");
      const response = await fetch("http://127.0.0.1:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    } finally {
      hideLoader();
    }
  };

  const unmapadmin = async (userId) => {
    showLoader();
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const token = getJwtCookie("jwt_admin");

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/users/unmapfromadmin/${userId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorBody = await response.text();
        alert(`${errorBody}`);
      }

      const data = await response.json();
      if (response.ok) {
        alert("User unmapped Successfully");
        await getAllUsers();
      }
    } catch (err) {
      console.error("Unmap admin error:", err);
      const errorMessage = err.message || "An unexpected error occurred";
      showErrorMessage(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      hideLoader();
    }
  };

  if (userSection) {
    userSection.addEventListener("click", renderTabs);
  }
};

userTab();
