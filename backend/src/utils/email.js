const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOTPEmail = async (to, otp) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: `"Serenova" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Serenova Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F1420; border-radius: 12px;">
        <h2 style="color: #6C63FF; margin-bottom: 8px;">Serenova</h2>
        <p style="color: #94A3B8; margin-bottom: 24px;">Your verification code</p>
        <div style="background: #1A2235; border-radius: 8px; padding: 24px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; color: #E2E8F0; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #475569; margin-top: 24px; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (to, resetLink) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[DEV] Password reset for ${to}: ${resetLink}`);
    return;
  }

  await transporter.sendMail({
    from: `"Serenova" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Serenova Password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F1420; border-radius: 12px;">
        <h2 style="color: #6C63FF; margin-bottom: 8px;">Serenova</h2>
        <p style="color: #94A3B8; margin-bottom: 24px;">Reset your password</p>
        <a href="${resetLink}" style="display:inline-block; background:#6C63FF; color:#fff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:bold;">Reset Password</a>
        <p style="color: #475569; margin-top: 24px; font-size: 14px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
