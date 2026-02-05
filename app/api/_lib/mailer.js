import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

export function smtpReady() {
  return Boolean(smtpHost && smtpUser && smtpPass && smtpFrom);
}

export async function sendOtpEmail({ to, code, expiresAt }) {
  if (!smtpReady()) {
    throw new Error("SMTP is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const subject = "Your Food Lover verification code";
  const text = `Your Food Lover verification code is ${code}. It expires at ${expiresAt.toISOString()}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>Food Lover verification code</h2>
      <p>Your one-time code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires at <strong>${expiresAt.toISOString()}</strong>.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  });
}
