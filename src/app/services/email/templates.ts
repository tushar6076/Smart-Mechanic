/**
 * 🛠️ DRY Global Layout Engine Wrapper
 * Surrounds child variables with a high-performance, system-terminal style envelope layout.
 */
const emailTheme = {
  background: "#09090b",
  surface: "#18181b",
  border: "#27272a",
  heading: "#f4f4f5",
  body: "#a1a1aa",
  muted: "#71717a",
  subtle: "#52525b",
  faint: "#3f3f46",
  strong: "#e4e4e7",
  primary: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  white: "#ffffff",
} as const;

function globalEmailLayout(title: string, preheader: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="background-color: ${emailTheme.background}; color: ${emailTheme.body}; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding: 20px; margin: 0; -webkit-font-smoothing: antialiased;">
        <span style="display: none; max-height: 0px; overflow: hidden;">${preheader}</span>
        <div style="max-width: 600px; margin: 0 auto; background-color: ${emailTheme.background}; border: 1px solid ${emailTheme.surface}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <div style="background-color: ${emailTheme.background}; padding: 32px 24px 16px 24px; border-bottom: 1px solid ${emailTheme.surface}; text-align: center;">
            <h1 style="color: ${emailTheme.heading}; font-size: 16px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;">SMART<span style="color: ${emailTheme.primary};">MECHANIC</span></h1>
            <p style="color: ${emailTheme.subtle}; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; margin: 4px 0 0 0;">Automated Engineering Ecosystem</p>
          </div>

          <div style="padding: 32px 24px;">
            ${contentHtml}
          </div>

          <div style="background-color: ${emailTheme.background}; padding: 24px; border-top: 1px solid ${emailTheme.surface}; text-align: center;">
            <p style="color: ${emailTheme.faint}; font-size: 10px; line-height: 1.5; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">
              This is an automated system monitoring transmission dispatched from core nodes.<br>
              © 2026 Smart Mechanic Platform Matrix. All permissions maintained.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
}

// =====================================================================
// 1. ACCOUNT IDENTITY & SECURITY LIFECYCLE
// =====================================================================

export const getWelcomeCustomerHtml = (username: string, dashboardUrl: string): string => globalEmailLayout(
  "Welcome to Smart Mechanic Core",
  "Your customer account framework configuration is active.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0;">// PROFILE ACTIVATION VALIDATED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Your secure customer operations routing account has been provisioned. You can now immediately file diagnostics tickets, query local technical field engineers, and manage active logistics assets.</p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="${dashboardUrl}" style="background-color: ${emailTheme.primary}; color: ${emailTheme.white}; padding: 12px 24px; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 6px; display: inline-block;">Initialize Entry Node</a>
    </div>
  `
);

export const getWorkerApplicationReceivedHtml = (username: string): string => globalEmailLayout(
  "Compliance Application Logged",
  "Your background routing ledger data has hit our verification stack.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// WORKER PROFILE SUBMITTED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Your Layer 4 engineering credentials, diagnostic specialties, and background authorization files have hit our auditing registry. A platform structural engineer will evaluate your identity variables within 24-48 runtime intervals.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin-top: 20px; font-size: 12px;">
      <span style="color: ${emailTheme.strong}; font-weight: 700;">Current Matrix State:</span>
      <span style="color: ${emailTheme.warning}; font-weight: 900; margin-left: 6px; text-transform: uppercase;">PENDING_VERIFICATION</span>
    </div>
  `
);

export const getWorkerScheduleInterviewHtml = (username: string, meetingLink: string, dateStr: string): string => globalEmailLayout(
  "Screening Sequence Arranged",
  "An identity evaluation sync window has been allocated with the admin core.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// ADMIN SCREENING SCHEDULED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">To finalize platform field access permissions, a security review meeting has been scheduled with the system back-office admin layer.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; line-height: 1.6;">
      <strong style="color: ${emailTheme.heading};">Sync Window Target:</strong> ${dateStr}<br>
      <strong style="color: ${emailTheme.heading};">Communication Channel:</strong> Digital Video Link
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${meetingLink}" style="background-color: ${emailTheme.primary}; color: ${emailTheme.white}; padding: 12px 24px; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 6px; display: inline-block;">Connect to Sync Node</a>
    </div>
  `
);

export const getWorkerDecisionHtml = (username: string, approved: boolean, notes?: string): string => globalEmailLayout(
  approved ? "Account Clearance Granted" : "Verification Vector Terminated",
  approved ? "Your workspace permissions are unlocked." : "Application rejected by core administration.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">
      ${approved ? "// WORKSPACE ACCESS CLEARANCE GRANTED" : "// APPLICATION DISAPPROVED"}
    </h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">
      ${approved 
        ? "Your credentials have been successfully audited and matched against active system blueprints. Your operational workspace interface is now active for ticketing deployments." 
        : "During manual compliance tracing, your engineering application profile failed to satisfy minimum operational constraints."}
    </p>
    ${notes ? `<div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 14px; border-radius: 6px; font-size: 11px; margin-top: 16px; line-height: 1.5;"><strong style="color: ${emailTheme.strong};">Admin Operations Note:</strong> ${notes}</div>` : ""}
  `
);

export const getLoginAlertHtml = (username: string, timeStr: string, resetUrl: string): string => globalEmailLayout(
  "Security Notification: Access Event Tracker",
  "A fresh session block has been logged using your credentials.",
  `
    <h3 style="color: ${emailTheme.primary}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// NEW SECURITY ACCESS LOGGED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">A successful account session initialization script executed on <strong>${timeStr}</strong>.</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.muted}; margin-bottom: 24px;">If this vector footprint does not map to your active coordinates, bypass the active session and overwrite parameters instantly:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" style="background-color: ${emailTheme.primary}; color: ${emailTheme.white}; padding: 12px 24px; text-decoration: none; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 6px; display: inline-block;">Secure Account Parameters</a>
    </div>
  `
);

export const getOtpHtml = (username: string, code: string): string => globalEmailLayout(
  "Verification Checkpoint Challenge",
  "Input this volatile security key string to overwrite access codes.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// IDENTITY SECURITY OTP CHALLENGE</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>, utilize the secure verification code below to authenticate your recovery window sequence:</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; color: ${emailTheme.primary}; font-size: 24px; font-weight: 900; letter-spacing: 0.25em; text-align: center; padding: 16px; margin: 24px 0; border-radius: 8px; font-family: monospace;">
      ${code}
    </div>
    <p style="font-size: 10px; color: ${emailTheme.subtle}; text-align: center; margin: 0;">This cryptographic string tracks short-lived system availability and completely self-erases inside Redis memory blocks after 600 seconds.</p>
  `
);

export const getResetSuccessHtml = (username: string): string => globalEmailLayout(
  "Password Reset Confirmed",
  "Your account access keys have been successfully updated.",
  `
    <h3 style="color: ${emailTheme.success}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// SECURITY CIPHER OVERWRITTEN</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">This communication verifies that your core entry password has been safely overwritten across database shards. All legacy verification objects matching this node have been successfully invalidated.</p>
  `
);

export const getDeleteAccountHtml = (username: string): string => globalEmailLayout(
  "Profile Eradication Confirmation",
  "All unique database tokens matching your profile have been purged.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// DATABASE ROW PURGE COMPLETE</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">This handles confirmation that your relational user rows, records, and metadata arrays have been cleanly removed from active cluster registers via hard cascade protocols.</p>
  `
);

// =====================================================================
// 2. SERVICE & FIELD ENGINEERING LOGISTICS (APPOINTMENTS)
// =====================================================================

export const getAppointmentScheduledHtml = (
  username: string, 
  bookingId: string, 
  vehicleDetails: string, 
  timeTarget: string, 
  partnerName: string
): string => globalEmailLayout(
  "Operational Ticket Block Allocated",
  "A field deployment block assignment has been committed.",
  `
    <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// FIELD SERVICE TICKETING SYNC</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">A structural schedule entry has been logged under verification node <strong>#${bookingId}</strong>.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; line-height: 1.6;">
      <strong style="color: ${emailTheme.strong};">Target Unit Core:</strong> ${vehicleDetails}<br>
      <strong style="color: ${emailTheme.strong};">Deployment Window:</strong> ${timeTarget}<br>
      <strong style="color: ${emailTheme.strong};">Assigned Entity Link:</strong> ${partnerName}
    </div>
  `
);

export const getJobCompletedHtml = (username: string, bookingId: string, completionNotes: string, paymentAmount: number): string => globalEmailLayout(
  "Field Ticket Execution Finalized",
  "The service block has returned a successful deployment completion code.",
  `
    <h3 style="color: ${emailTheme.success}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// ENGINES DIAGNOSTICS DISCHARGE COMPLETE</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Ticket index block <strong>#${bookingId}</strong> has been marked as fully executed by the engineering dispatcher.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; line-height: 1.6;">
      <strong style="color: ${emailTheme.strong};">Resolution Metrics:</strong> ${completionNotes}<br>
      <strong style="color: ${emailTheme.strong};">Settled Amount:</strong> INR ${paymentAmount.toFixed(2)}
    </div>
  `
);

export const getAppointmentCanceledHtml = (username: string, bookingId: string, reasonStr: string): string => globalEmailLayout(
  "Appointment Deployment Interrupted",
  "Service block has been unallocated and canceled.",
  `
    <h3 style="color: ${emailTheme.primary}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// FIELD SERVICE DEPLOYMENT ABORTED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Please note that field service assignment entry <strong>#${bookingId}</strong> was stripped from the execution pipeline.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 14px; border-radius: 6px; font-size: 11px; margin-top: 16px; color: ${emailTheme.primary};">
      <strong>Interruption Diagnostic Root Cause:</strong> ${reasonStr}
    </div>
  `
);

// =====================================================================
// 3. SUPPLY CHAIN & E-COMMERCE LOGISTICS (PRODUCTS)
// =====================================================================

export const getOrderUpdateHtml = (username: string, orderId: string, status: "PLACED" | "DELIVERED" | "CANCELED", manifestSummary: string): string => {
  const colorMap = { PLACED: "${emailTheme.info}", DELIVERED: "${emailTheme.success}", CANCELED: "${emailTheme.primary}" };
  return globalEmailLayout(
    "Supply Line Progress Event",
    `Your e-commerce equipment tracking sequence state shifted to ${status}.`,
    `
      <h3 style="color: ${emailTheme.heading}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// SUPPLY CHAIN DISPATCH TELEMETRY</h3>
      <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
      <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Your commercial equipment purchase reference <strong>#${orderId}</strong> has progressed.</p>
      <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12px; line-height: 1.6;">
        <strong style="color: ${emailTheme.strong};">Manifest Units:</strong> ${manifestSummary}<br>
        <strong style="color: ${emailTheme.strong};">Logistics Flag state:</strong> <span style="color: ${colorMap[status]}; font-weight: 900; text-transform: uppercase;">${status}</span>
      </div>
    `
  );
};

// =====================================================================
// 4. EDGE CONFIGURATIONS (OPERATIONAL SECURITY EDGE TRIGGERS)
// =====================================================================

export const getPaymentFailedHtml = (username: string, referenceToken: string, coreAmount: number): string => globalEmailLayout(
  "Transaction Pipeline Checkpoint Failure",
  "Bilateral clearing failed during authorization check.",
  `
    <h3 style="color: ${emailTheme.primary}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// TRANSACTION PRE-AUTH ABORTED</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${username}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Our payment engine gateway tracking socket rejected an uncommitted clearance action for reference token <strong>#${referenceToken}</strong>.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 12px;">
      <strong style="color: ${emailTheme.strong};">Attempted Balance Hold:</strong> INR ${coreAmount.toFixed(2)}<br>
      <strong style="color: ${emailTheme.primary};">Status Response:</strong> INSUFFICIENT_FUNDS_OR_ROUTING_REJECTION
    </div>
  `
);

export const getWorkerDelayAlertHtml = (customerName: string, bookingId: string, delayMinutes: number): string => globalEmailLayout(
  "Logistics Operational Latency Alert",
  "A deployment latency event has been reported by your assigned mechanic.",
  `
    <h3 style="color: ${emailTheme.warning}; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-top: 0;">// DEPLOYMENT INTERVAL DELAY ALERT</h3>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">Hello <strong>${customerName}</strong>,</p>
    <p style="font-size: 12px; line-height: 1.7; color: ${emailTheme.body};">An unpreventable transit bottleneck has introduced a delay for service ticket <strong>#${bookingId}</strong>.</p>
    <div style="background-color: ${emailTheme.surface}; border: 1px solid ${emailTheme.border}; padding: 16px; border-radius: 6px; margin-top: 20px; font-size: 12px;">
      <strong style="color: ${emailTheme.strong};">Estimated Drift Margin:</strong> +${delayMinutes} runtime minutes.<br>
      <span style="color: ${emailTheme.muted}; font-size: 11px;">The engineer remains connected to the tracking cluster and is actively routing towards your coordinates.</span>
    </div>
  `
);