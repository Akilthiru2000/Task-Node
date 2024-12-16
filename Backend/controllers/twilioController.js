const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendOTP = async (req, res) => {
  //send the otp the mobile by admin only
  const { countryCode, phoneNumber } = req.body;

  if (!countryCode || !phoneNumber) {
    return res.status(400).json({
      error: "Country code and phone number are required",
    });
  }

  try {
    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+${countryCode}${phoneNumber}`,
        channel: "sms",
      });

    res.status(200).json({
      message: "OTP sent successfully",
      data: otpResponse,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Failed to send OTP",
    });
  }
};

const verifyOTP = async (req, res) => {
  // verify the otp recieved
  const { countryCode, phoneNumber, otp } = req.body;

  if (!countryCode || !phoneNumber || !otp) {
    return res.status(400).json({
      error: "Country code, phone number, and OTP are required",
    });
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+${countryCode}${phoneNumber}`,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      res.status(200).json({
        message: "OTP verified successfully",
        data: verificationCheck,
      });
    } else {
      res.status(400).json({
        error: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Failed to verify OTP",
    });
  }
};

module.exports = { sendOTP, verifyOTP };
