const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
      port: parseInt(process.env.SMTP_PORT || "587", 10), // Typically 587 for TLS or 465 for SSL
      secure: process.env.SMTP_SECURE === "true", // Use true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // this.transporter.verify((error, success) => {
    //     if (error) {
    //       console.log(`${"Error configuring Nodemailer transporter:"}`, error);
    //     } else {
    //       console.log("Nodemailer transporter configured successfully:", success);
    //     }
    //   });
  }

  // Method to send an email
  async sendEmail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = EmailService;
