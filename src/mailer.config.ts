import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';

export const mailerConfig = {
  transport: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
    },
  },
  defaults: {
    from: process.env.EMAIL_FROM || 'noreply@example.com', // Default sender
  },
  template: {
    dir: path.join(__dirname, '../src/templates'),
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
};