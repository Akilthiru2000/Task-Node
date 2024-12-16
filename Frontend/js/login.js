document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";

    if (!email || !password) {
      errorMessage.textContent = "Email and password are required.";
      return;
    }

    loginUser(email, password, errorMessage);
  });

const loginUser = async (email, password, errorMessage) => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Ensure credentials (cookies) are included in the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    if (data && data.data.user) {
      const userRole = data.data.user.role;
      console.log(userRole);

      if (userRole === "admin") {
        window.location.href = "/dashboard.html";
      } else {
        window.location.href = "/user-dashboard.html";
      }
      errorMessage.textContent = "Login successful!";
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (error) {
    errorMessage.textContent = error.message;
  }
};
