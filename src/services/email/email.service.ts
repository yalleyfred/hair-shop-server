import { Injectable } from '@nestjs/common';
import { Bookings } from '../../models/bookings.model';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { defaultFrom, getTemplatePath, mailTransport } from '../../mailer.config';

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport(mailTransport);

  public async sendBookingEmail(booking: Bookings): Promise<void> {
    const {email, name, appointmentDate, appointmentTime, serviceType, phone} = booking;
    const bookingDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    try {
      const html = pug.renderFile(getTemplatePath('bookings'), {
        name,
        bookingDate,
        appointmentTime,
        serviceType,
        phone,
        email,
      });

      await this.transporter.sendMail({
        from: defaultFrom,
        to: email,
        bcc: 'yalleyfred@gmail.com',
        subject: 'Welcome to Our App!',
        html,
      });
      console.log('Email sent')
    } catch (error) {
      console.error('Error sending email', error)
    }
    }


}
