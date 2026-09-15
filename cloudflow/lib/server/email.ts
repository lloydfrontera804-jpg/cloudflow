import nodemailer from 'nodemailer';

// Brevo (formerly Sendinblue) SMTP relay — a free alternative to Gmail SMTP
// that doesn't require 2-Step Verification / App Passwords. It only needs
// a single verified sender email (confirmed via a link click in Brevo's
// dashboard) rather than a full domain or a 2FA-protected Google account.
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // Brevo uses STARTTLS on port 587, not implicit TLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// This MUST be the exact email address you verified as a Sender in Brevo's
// dashboard (Senders, Domains & Dedicated IPs → Senders) — Brevo rejects
// sends from any address that isn't verified there.
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER;

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  try {
    await transporter.sendMail({
      from: `"RemoteVM Workspace" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: 'Reset your password',
      html: `
        <p>Someone (hopefully you) requested a password reset for your account.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 30 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `,
    });
  } catch (err) {
    console.error('Brevo SMTP failed to send password reset email:', err);
    throw err;
  }
}
