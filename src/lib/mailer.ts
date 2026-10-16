import nodemailer from "nodemailer";

const mailHost = process.env.MAIL_SERVER;
const mailPort = Number(process.env.MAIL_PORT || 587);
const mailUsername = process.env.MAIL_USERNAME;
const mailPassword = process.env.MAIL_PASSWORD;

if (!Number.isInteger(mailPort) || mailPort < 1 || mailPort > 65535) {
  throw new Error("MAIL_PORT must be a valid TCP port number.");
}

export const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  secure: mailPort === 465,
  requireTLS: mailPort !== 465,
  auth: mailUsername && mailPassword
    ? { user: mailUsername, pass: mailPassword }
    : undefined,
});

export const defaultSender = `"${process.env.MAIL_FROM_NAME || "Smart Mechanic"}" <${process.env.MAIL_FROM || mailUsername || ""}>`;

export function assertMailConfiguration(): void {
  const missing = [
    ["MAIL_SERVER", mailHost],
    ["MAIL_USERNAME", mailUsername],
    ["MAIL_PASSWORD", mailPassword],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required SMTP configuration: ${missing.join(", ")}`);
  }
}

if (process.env.NODE_ENV === "development") {
  if (!mailHost || !mailUsername || !mailPassword) {
    console.error("SMTP connection check skipped: MAIL_SERVER, MAIL_USERNAME, and MAIL_PASSWORD are required.");
  } else {
    transporter.verify((error) => {
    if (error) {
      console.error("❌ Email SMTP Subsystem Connection Fault:", error.message);
    } else {
      console.log("🚀 Email SMTP Subsystem Connected & Operational");
    }
    });
  }
}