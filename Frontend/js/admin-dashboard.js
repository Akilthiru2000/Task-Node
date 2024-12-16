document.addEventListener("DOMContentLoaded", () => {
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const mainContent = document.getElementById("mainContent");

  const contentTemplates = {
    tasks: `
      <ul>
        <li class='maintab'><a href="/taskcreate.html">Create Task</a></li>
        <li class='maintab'><a href="/dashboard.html">Manage Tasks</a></li>
      </ul>
    `,
    users: `
      <h2>Users</h2>
      <ul>
        <li class='maintab'><a href="/userCreate.html">Create User</a></li>
        <li class='maintab'><a href="/manage-users.html">Manage Users</a></li>
      </ul>
    `,
    claim: `
    <h2>Claim</h2>
  `,
  };

  sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {
      sidebarItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      const section = item.getAttribute("data-section");
      mainContent.innerHTML = contentTemplates[section] || "<h2>Not Found</h2>";
    });
  });
});
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
