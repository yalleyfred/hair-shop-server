import * as fs from 'fs';
import * as path from 'path';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const mailTransport: SMTPTransport.Options = {
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
};

export const defaultFrom = process.env.EMAIL_FROM || 'noreply@example.com';

export const getTemplatePath = (templateName: string): string => {
  const candidates = [
    path.join(process.cwd(), 'src', 'templates', `${templateName}.pug`),
    path.join(process.cwd(), 'dist', 'templates', `${templateName}.pug`),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
};