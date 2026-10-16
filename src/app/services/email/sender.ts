import { assertMailConfiguration, transporter, defaultSender } from "@/lib/mailer";
import * as templates from "./templates";

/**
 * Pure transport layer: Only responsible for injecting variables 
 * into templates and executing the SMTP delivery pipeline.
 */
async function dispatch(to: string, subject: string, html: string) {
  assertMailConfiguration();
  await transporter.sendMail({
    from: defaultSender,
    to,
    subject,
    html,
  });
}

// --- 1. IDENTITY & SECURITY LIFECYCLE ---

export const sendWelcomeCustomer = (email: string, username: string) => 
  dispatch(email, "Welcome to Smart Mechanic", templates.getWelcomeCustomerHtml(username, `${process.env.NEXTAUTH_URL}/user`));

export const sendWorkerApplicationReceived = (email: string, username: string) => 
  dispatch(email, "Application Received - Smart Mechanic", templates.getWorkerApplicationReceivedHtml(username));

export const sendWorkerScheduleInterview = (email: string, username: string, meetingLink: string, date: string) => 
  dispatch(email, "Interview Scheduled", templates.getWorkerScheduleInterviewHtml(username, meetingLink, date));

export const sendWorkerDecision = (email: string, username: string, approved: boolean, notes?: string) => 
  dispatch(email, approved ? "Application Approved" : "Application Status Update", templates.getWorkerDecisionHtml(username, approved, notes));

export const sendLoginAlert = (email: string, username: string) => 
  dispatch(email, "Security Alert: New Login", templates.getLoginAlertHtml(username, new Date().toLocaleString(), `${process.env.NEXTAUTH_URL}/auth/forgot`));

export const sendOtp = (email: string, username: string, code: string) => 
  dispatch(email, "Your Verification Code", templates.getOtpHtml(username, code));

export const sendResetSuccess = (email: string, username: string) => 
  dispatch(email, "Password Reset Successful", templates.getResetSuccessHtml(username));

export const sendDeleteAccount = (email: string, username: string) => 
  dispatch(email, "Account Deleted", templates.getDeleteAccountHtml(username));

// --- 2. APPOINTMENTS ---

export const sendAppointmentScheduled = (email: string, username: string, bookingId: string, vehicle: string, time: string, partner: string) => 
  dispatch(email, `Appointment Scheduled #${bookingId}`, templates.getAppointmentScheduledHtml(username, bookingId, vehicle, time, partner));

export const sendJobCompleted = (email: string, bookingId: string, emailAddr: string, username: string, notes: string, amount: number) => 
  dispatch(email, `Job Finalized #${bookingId}`, templates.getJobCompletedHtml(username, bookingId, notes, amount));

export const sendAppointmentCanceled = (email: string, emailAddr: string, username: string, bookingId: string, reason: string) => 
  dispatch(email, `Appointment Canceled #${bookingId}`, templates.getAppointmentCanceledHtml(username, bookingId, reason));

// --- 3. E-COMMERCE ---

export const sendOrderUpdate = (email: string, username: string, orderId: string, status: "PLACED" | "DELIVERED" | "CANCELED", summary: string) => 
  dispatch(email, `Order Update #${orderId}`, templates.getOrderUpdateHtml(username, orderId, status, summary));

// --- 4. EDGE TRIGGERS ---

export const sendPaymentFailed = (email: string, username: string, ref: string, amount: number) => 
  dispatch(email, "Payment Authorization Failed", templates.getPaymentFailedHtml(username, ref, amount));

export const sendWorkerDelayAlert = (email: string, customer: string, bookingId: string, minutes: number) => 
  dispatch(email, "Delay Alert: Mechanic Status", templates.getWorkerDelayAlertHtml(customer, bookingId, minutes));