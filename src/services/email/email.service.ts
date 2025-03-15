import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Bookings } from 'src/models/bookings.model';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

  public async sendBookingEmail(booking: Bookings): Promise<void> {
    const {email, name, appointmentDate, appointmentTime, serviceType, phone} = booking;
    const bookingDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    try {
       await this.mailerService.sendMail({
        to: email,
        bcc: 'yalleyfred@gmail.com',
        subject: 'Welcome to Our App!',
        template: '../../templates/bookings',
        context: {
          name,
          bookingDate,
          appointmentTime,
          serviceType,
          phone,
          email,
        },
      });
      console.log('Email sent')
    } catch (error) {
      console.error('Error sending email', error)
    }
    }


}
