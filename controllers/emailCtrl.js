const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MP,
  },
});
const sendEmail = asyncHandler(async (data, req, res) => {
  const info = await transporter.sendMail({
    from: process.env.MAIL_ID,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htm,
  });

  console.log("Message sent: %s", info.messageId);
});

module.exports = sendEmail;
