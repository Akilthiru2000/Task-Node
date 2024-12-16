const express = require("express");
const twilioController = require("./../controllers/twilioController");

const router = express.Router();

router.route("/send-otp").post(twilioController.sendOTP);

router.route("/verify-otp").post(twilioController.verifyOTP);

module.exports = router;
