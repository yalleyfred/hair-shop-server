import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';

export const mailerConfig = {
  transport: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: "879124001@smtp-brevo.com",
        pass: "tR1y6AaGjNCJ4H98",
    },
  },
  defaults: {
    from: 'yalleyfred@gmail.com', // Default sender
  },
  template: {
    dir: path.join(__dirname, '../src/templates'),
    adapter: new PugAdapter(),
    options: {
      strict: true,
    },
  },
};