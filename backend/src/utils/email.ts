import nodemailer from 'nodemailer';

// Stubbed/mock implementation for development and testing.
// In production, configure SMTP settings using environment variables.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (process.env.NODE_ENV === 'test') {
    // Skip real sending in tests
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TrackSentra Support" <support@tracksentra.com>',
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('Email send error:', error);
    // Do not throw to prevent breaking workflows
  }
};
