const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "rapgrinder.nazwa.pl",
  port: 465,
  secure: true,
  auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  },
  });

transporter.verify((error, success) => {
  if (error) {
    console.log(`${"Error configuring Nodemailer transporter:"}`, error);
  } else {
    console.log("Nodemailer transporter configured successfully:", success);
  }
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
