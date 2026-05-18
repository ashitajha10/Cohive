const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Use SMTP variables if configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: SMTP_USER or SMTP_PASS is missing in backend/.env. Emails will not be sent! Plaintext reset link will be printed in the server logs.');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000 // 10 seconds max timeout
  });
};

const sendResetEmail = async (toEmail, resetLink) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('\x1b[36m%s\x1b[0m', `🔗 [DEV FALLBACK] Password Reset Link for ${toEmail}: ${resetLink}`);
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Cohive" <noreply@cohive.com>',
    to: toEmail,
    subject: 'Restore Your Cohive Workspace Access',
    text: `Restore Access to your Cohive workspace by visiting this link: ${resetLink} (Link expires in 30 minutes)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restore Workspace Access</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
          body {
            background-color: #f9fafb;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1f2937;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 540px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #f3f4f6;
            border-radius: 36px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.05);
          }
          .header {
            padding: 40px 40px 20px 40px;
            text-align: center;
          }
          .content {
            padding: 20px 40px 45px 40px;
            text-align: center;
          }
          h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #111827;
            margin: 0 0 16px 0;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: #6b7280;
            margin: 0 0 32px 0;
            font-weight: 500;
          }
          .btn-container {
            margin: 32px 0;
          }
          .btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: #ffffff !important;
            padding: 18px 40px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            text-decoration: none;
            border-radius: 20px;
            display: inline-block;
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);
            transition: all 0.3s ease;
          }
          .footer {
            padding: 30px 40px;
            background: #f9fafb;
            border-top: 1px solid #f3f4f6;
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            letter-spacing: 0.05em;
            font-weight: 600;
          }
          .subtle-link {
            word-break: break-all;
            font-size: 12px;
            color: #8b5cf6;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <!-- 3D Brand Logo Rendering -->
            <svg viewBox="0 0 100 100" width="72" height="72" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
              <defs>
                <linearGradient id="purpleTop" x1="50" y1="15" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#c084fc" />
                  <stop offset="100%" stop-color="#8b5cf6" />
                </linearGradient>
                <linearGradient id="purpleLeft" x1="20" y1="32.5" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#6366f1" />
                </linearGradient>
                <linearGradient id="purpleCore" x1="56.34" y1="48" x2="73.66" y2="68" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#ec4899" />
                  <stop offset="100%" stop-color="#d946ef" />
                </linearGradient>
              </defs>
              <!-- Top Face -->
              <path d="M50 15 L80 32.5 L50 50 L20 32.5 Z" fill="url(#purpleTop)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
              <!-- Left Face -->
              <path d="M20 32.5 L50 50 L50 85 L20 67.5 Z" fill="url(#purpleLeft)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
              <!-- Central Hexagon Core -->
              <path d="M 65 48 L 73.66 53 L 73.66 63 L 65 68 L 56.34 63 L 56.34 53 Z" fill="url(#purpleCore)" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
            </svg>
          </div>
          <div class="content">
            <h1>Restore Access</h1>
            <p>We received a request to restore access to your Cohive workspace. Click the secure connection link below to reinitialize and configure your password.</p>
            <div class="btn-container">
              <a href="${resetLink}" class="btn" target="_blank">Restore Workspace Access</a>
            </div>
            <p style="margin-top: 36px; font-size: 12px; color: #9ca3af;">If you did not request this reinitialization, you can safely ignore this transmission. This link is only valid for 30 minutes.</p>
            <div style="margin-top: 28px; padding-top: 28px; border-top: 1px solid #f3f4f6;">
              <p style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">Alternatively, copy and paste this link in your browser:</p>
              <a href="${resetLink}" class="subtle-link">${resetLink}</a>
            </div>
          </div>
          <div class="footer">
            COHIVE COOPERATIVE WORKSPACE NETWORK &bull; CLOUD DIVISION
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Recovery Email dispatched: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Failed to dispatch recovery email via SMTP, logging link as fallback:', err.message);
    console.log('\x1b[36m%s\x1b[0m', `🔗 [FALLBACK LINK] Password Reset Link for ${toEmail}: ${resetLink}`);
    return { success: true, simulated: true, error: err.message };
  }
};

module.exports = { sendResetEmail };
