validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneNumber);
};

document
  .getElementById("userForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: Number(document.getElementById("number").value.trim()),
      password: document.getElementById("password").value,
      passwordConfirm: document.getElementById("passwordConfirm").value,
    };

    const userRole = document.getElementById("userRole").value;
    if (!validatePhoneNumber(formData.phone)) {
      document.getElementById("responseMessage").innerText =
        "Error:Please enter a valid 10-digit phone number";
      document.getElementById("responseMessage").style.color = "red";
      return;
    }

    if (userRole !== "admin") {
      document.getElementById("responseMessage").innerText =
        "Error: Only admins can create users.";
      document.getElementById("responseMessage").style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        document.getElementById("responseMessage").innerText =
          "User created successfully!";
        document.getElementById("responseMessage").style.color = "green";
        document.getElementById("userForm").reset(); // Clear the form
        window.location.href = "";
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
