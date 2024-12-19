const claimTab = () => {
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
  const claimSection = document.querySelector(
    ".sidebar-item[data-section='claim']"
  );
  const mainContent = document.getElementById("mainContent");

  const renderTabs = async () => {
    mainContent.innerHTML = `
     <div class="claim-users">
        <h2>Claim Users</h2>
        <table id="claimUsersTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div id="claimErrorMessage"></div>
        <div id="claimResponseMessage"></div>
      </div>
    `;

    await getClaimUser();

    const usersTable = document.getElementById("claimUsersTable");
    if (usersTable) {
      usersTable.addEventListener("click", (event) => {
        const claimButton = event.target.closest("button");
        if (claimButton) {
          // console.log("Button clicked!");
          const userRow = claimButton.closest("tr");
          if (userRow) {
            const userId =
              userRow.querySelector("td[data-user-id]").dataset.userId;
            // console.log(`User ID: ${userId}`);
            mapUserToAdmin(userId);
          }
        }
      });
    }
  };

  const getClaimUser = async () => {
    try {
      const token = getJwtCookie("jwt");
      const response = await fetch("http://127.0.0.1:3000/api/v1/users/claim", {
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
      const tableBody = document.querySelector("#claimUsersTable tbody");

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
          <td data-user-id=${user._id}><button class="btn-unlink">Claim</button></td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error(error.message);
      document.getElementById("claimErrorMessage").innerText =
        "Failed to load users. Please try again later.";
    }
  };
  const mapUserToAdmin = async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const token = getJwtCookie("jwt");

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/users/mapbyadmin/${userId}`,
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
      // console.log(data);
      if (response.ok) {
        document.getElementById("claimResponseMessage").innerText =
          "User mapped Successfully";
        await getClaimUser();
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "An unexpected error occurred";
      showErrorMessage(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  if (claimSection) {
    claimSection.addEventListener("click", renderTabs);
  }
};

claimTab();
