const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const User = require("../models/userModel");
const accountSid = "AC44cdab0ec79fa3b7f3367f10380a55f1";
const authToken = "e19f6d348f98f92223f70f682f018ec3";
const verifySid = "VA10f21059de7b4ba53ad41e4ef4f36af1";

const client = twilio(accountSid, authToken);

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }); // Tìm người dùng theo email

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const verification = await client.verify
      .services(verifySid)
      .verifications.create({ to: user.phone, channel: "sms" });

    console.log(verification.status);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Endpoint để xác minh mã OTP
router.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;

  try {
    const verificationCheck = await client.verify
      .services(verifySid)
      .verificationChecks.create({ to: phone, code });

    if (verificationCheck.status === "approved") {
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

module.exports = router;
