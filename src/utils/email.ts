import nodemailer, { type Transporter } from "nodemailer";
import config from "../config/index.js";

let transporter: Transporter | null = null;

export const getMailTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.smtp_user,
        pass: config.email.smtp_password,
      },
    });
  }
  return transporter;
};

// Verify SMTP connection on startup
export const verifySmtpConnection = async (): Promise<boolean> => {
  try {
    if (!config.email.smtp_user || !config.email.smtp_password) {
      console.warn("[Email] Warning: SMTP_USER or SMTP_PASSWORD not set in .env");
      return false;
    }
    const mailer = getMailTransporter();
    await mailer.verify();
    console.log("Email SMTP service (Gmail) connected successfully.");
    return true;
  } catch (error: any) {
    console.warn(`[Email] SMTP verification warning: ${error?.message || error}`);
    return false;
  }
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    if (!config.email.smtp_user || !config.email.smtp_password) {
      console.warn(`[Email] Skipping email to ${options.to} (SMTP credentials not configured)`);
      return false;
    }
    const mailer = getMailTransporter();
    const mailOptions = {
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const info = await mailer.sendMail(mailOptions);
    console.log(`[Email] Sent "${options.subject}" to ${options.to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`[Email] Error sending email to ${options.to}:`, error?.message || error);
    return false;
  }
};

// 1. Password Reset OTP Email
export const sendOtpEmail = async (to: string, otp: string, name?: string): Promise<boolean> => {
  const recipientName = name || "BloodLink User";
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px; }
      .otp-box { text-align: center; margin: 30px 0; padding: 20px; background: #fff5f5; border: 2px dashed #feb2b2; border-radius: 10px; }
      .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e53e3e; font-family: monospace; }
      .otp-validity { font-size: 13px; color: #718096; margin-top: 8px; }
      .warning { font-size: 13px; color: #742a2a; background: #fed7d7; padding: 12px 16px; border-radius: 8px; margin-top: 24px; line-height: 1.5; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink</h1>
        <p>Password Reset Verification Code</p>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${recipientName}!</div>
        <div class="desc">
          We received a request to reset the password for your BloodLink account. Please use the One-Time Password (OTP) below to complete your password change:
        </div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-validity">This code is valid for <strong>10 minutes</strong>.</div>
        </div>
        <div class="warning">
          <strong>Security Notice:</strong> Never share this code with anyone. BloodLink staff will never ask for your OTP. If you did not request this password reset, please ignore this email or review your account security immediately.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} BloodLink. Saving lives together.<br/>
        This is an automated system email, please do not reply.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({
    to,
    subject: `Your BloodLink Password Reset OTP: ${otp}`,
    html,
  });
};

// 2. Password Changed Confirmation Email
export const sendPasswordChangedEmail = async (
  to: string,
  name?: string,
  changedAt?: Date,
): Promise<boolean> => {
  const recipientName = name || "BloodLink User";
  const formattedTime = (changedAt || new Date()).toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 20px; }
      .status-box { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
      .alert-box { background: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 14px 18px; margin-top: 24px; font-size: 13px; color: #7b341e; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink Security Alert</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${recipientName},</div>
        <div class="desc">
          Your BloodLink account password has been <strong>successfully changed</strong>.
        </div>
        <div class="status-box">
          <strong>Time of Change:</strong> ${formattedTime} (BST)<br/>
          <strong>Status:</strong> Completed Successfully
        </div>
        <div class="alert-box">
          <strong>Didn't make this change?</strong><br/>
          If you did not initiate this change, someone else may have gained unauthorized access to your account. Please reset your password immediately and contact BloodLink support.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} BloodLink Platform. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({
    to,
    subject: "Security Alert: Your BloodLink password was changed",
    html,
  });
};

// 3. New Login Alert Email
export const sendLoginAlertEmail = async (
  to: string,
  name?: string,
  ipAddress?: string,
): Promise<boolean> => {
  const recipientName = name || "BloodLink User";
  const formattedTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #38a169 0%, #276749 100%); padding: 26px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; }
      .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
      .details-table td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
      .details-table td.label { font-weight: 600; color: #4a5568; width: 35%; background: #f7fafc; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink Account Login Notice</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${recipientName}!</div>
        <p class="desc">A new login to your BloodLink account was detected.</p>
        <table class="details-table">
          <tr>
            <td class="label">Date & Time</td>
            <td>${formattedTime} (BST)</td>
          </tr>
          <tr>
            <td class="label">IP Address</td>
            <td>${ipAddress || "Recognized Device"}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #718096; margin-top: 20px;">
          If this was you, you can safely disregard this message. If you do not recognize this activity, please change your password immediately.
        </p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} BloodLink Security Team
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({
    to,
    subject: "BloodLink Security: New login to your account",
    html,
  });
};

// 4. Welcome Email on Registration
export const sendWelcomeEmail = async (to: string, name: string): Promise<boolean> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #e53e3e 0%, #9b2c2c 100%); padding: 36px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; }
      .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.95; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 20px; font-weight: 700; margin-bottom: 14px; color: #1a202c; }
      .desc { font-size: 15px; line-height: 1.7; color: #4a5568; margin-bottom: 20px; }
      .feature-box { background: #fff5f5; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
      .feature-box ul { margin: 8px 0 0 20px; padding: 0; }
      .feature-box li { margin-bottom: 8px; font-size: 14px; color: #742a2a; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to BloodLink</h1>
        <p>Connecting Donors, Saving Lives</p>
      </div>
      <div class="content">
        <div class="greeting">Welcome aboard, ${name}!</div>
        <p class="desc">
          Thank you for joining <strong>BloodLink</strong>. Your registration brings us one step closer to ensuring no patient has to suffer due to blood unavailability in emergency situations.
        </p>
        <div class="feature-box">
          <strong style="color: #9b2c2c;">With your BloodLink account, you can:</strong>
          <ul>
            <li>Set up your profile and upload an HD avatar</li>
            <li>Register as a voluntary blood donor</li>
            <li>Post urgent blood requests for family and friends</li>
            <li>Connect with verified donors in your district</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} BloodLink Platform. Together we save lives!
      </div>
    </div>
  </body>
  </html>
  `;

  return sendEmail({
    to,
    subject: "Welcome to BloodLink - Empowering Donors & Saving Lives",
    html,
  });
};

export const EmailService = {
  sendEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendLoginAlertEmail,
  sendWelcomeEmail,
  verifySmtpConnection,
};

export default EmailService;
