import nodemailer from "nodemailer";

// 🛰️ Construct SMTP Transport connection pool using exact .env variables
export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT || "587"),
  secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports like 587
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// 🏷️ Format standard sender signature format: "Name" <email@domain.com>
export const defaultSender = `"${process.env.MAIL_FROM_NAME || "Smart Mechanic"}" <${process.env.MAIL_FROM || "noreply@smartmechanic.com"}>`;

// Optional: Run a quick connection checkpoint diagnostic during initialization in dev environments
if (process.env.NODE_ENV === "development") {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ Email SMTP Subsystem Connection Fault:", error.message);
    } else {
      console.log("🚀 Email SMTP Subsystem Connected & Operational");
    }
  });
}