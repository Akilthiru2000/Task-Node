const countryCodeSelect = document.getElementById("country-code");
const phoneNumberInput = document.getElementById("phone-number");
const sendOTPBtn = document.getElementById("send-otp-btn");
const otpVerifySection = document.getElementById("otp-verify-section");
const phoneInputSection = document.getElementById("phone-input-section");
const otpInput = document.getElementById("otp-input");
const verifyOTPBtn = document.getElementById("verify-otp-btn");
const statusMessage = document.getElementById("status-message");
const resendOTPLink = document.getElementById("resend-otp");
const loader = document.getElementById("loader");

function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneNumber);
}

function validateOTP(otp) {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
}

async function sendOTP() {
  const countryCode = countryCodeSelect.value;
  const phoneNumber = phoneNumberInput.value;

  if (!validatePhoneNumber(phoneNumber)) {
    showStatus("Please enter a valid 10-digit phone number", "error");
    return;
  }

  try {
    loader.classList.add("active");
    const response = await fetch(`http://127.0.0.1:3000/api/v1/user/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ countryCode, phoneNumber }),
    });

    const result = await response.json();

    if (response.ok) {
      showStatus("OTP sent successfully", "success");
      phoneInputSection.style.display = "none";
      otpVerifySection.style.display = "block";
    } else {
      showStatus(result.error || "Failed to send OTP", "error");
    }
  } catch (error) {
    showStatus("Network error. Please try again.", "error");
    console.error("Send OTP Error:", error);
  } finally {
    loader.classList.remove("active");
  }
}

async function verifyOTP() {
  const countryCode = countryCodeSelect.value;
  const phoneNumber = phoneNumberInput.value;
  const otp = otpInput.value;

  if (!validateOTP(otp)) {
    showStatus("Please enter a valid 6-digit OTP", "error");
    return;
  }

  try {
    loader.classList.add("active");
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/user/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ countryCode, phoneNumber, otp }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      showStatus("Phone number verified successfully!", "success");
      window.location.href = "/admin-dashboard.html";
    } else {
      showStatus(result.error || "OTP verification failed", "error");
    }
  } catch (error) {
    showStatus("Network error. Please try again.", "error");
    console.error("Verify OTP Error:", error);
  } finally {
    loader.classList.remove("active");
  }
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;
}

function resetVerification() {
  phoneInputSection.style.display = "block";
  otpVerifySection.style.display = "none";
  statusMessage.textContent = "";
  otpInput.value = "";
}

sendOTPBtn.addEventListener("click", sendOTP);
verifyOTPBtn.addEventListener("click", verifyOTP);
resendOTPLink.addEventListener("click", sendOTP);

phoneNumberInput.addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
});

otpInput.addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
});
