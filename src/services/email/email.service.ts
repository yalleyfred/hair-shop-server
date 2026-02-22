import { Injectable, Logger } from '@nestjs/common';
import { Bookings } from '../../models/bookings.model';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as pug from 'pug';
import {
  getDefaultFrom,
  getMailTransport,
  getMailTransportWithPort,
  getSmtpFallbackPort,
  getSmtpRetryAttempts,
  getTemplatePath,
} from '../../mailer.config';

type OrderType = 'product_purchase' | 'service_booking';

type OrderNotificationProduct = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type OrderNotificationBooking = {
  serviceType: string;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
};

export type OrderNotificationPayload = {
  orderType: OrderType;
  reference: string;
  customerEmail: string;
  customerName?: string | null;
  customerPhone?: string | null;
  amountPaid: number;
  currency?: string | null;
  paidAt?: string | null;
  paymentChannel?: string | null;
  products: OrderNotificationProduct[];
  booking?: OrderNotificationBooking | null;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport(getMailTransport());
  private readonly fallbackPort = getSmtpFallbackPort();
  private readonly retryAttempts = getSmtpRetryAttempts();

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isRetryableSmtpError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const smtpError = error as { code?: unknown; command?: unknown };
    return smtpError.code === 'ETIMEDOUT' || smtpError.command === 'CONN';
  }

  private async sendMailWithReliability(
    options: Mail.Options,
    contextLabel: string,
  ): Promise<void> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.transporter.sendMail(options);
        return;
      } catch (error) {
        lastError = error;
        if (!this.isRetryableSmtpError(error) || attempt === this.retryAttempts) {
          break;
        }
        this.logger.warn(
          `${contextLabel} retry ${attempt + 1}/${this.retryAttempts} after SMTP timeout`,
        );
      }
    }

    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    if (
      this.fallbackPort &&
      this.fallbackPort !== smtpPort &&
      this.isRetryableSmtpError(lastError)
    ) {
      try {
        const fallbackTransporter = nodemailer.createTransport(
          getMailTransportWithPort(this.fallbackPort),
        );
        await fallbackTransporter.sendMail(options);
        this.logger.warn(
          `${contextLabel} succeeded using fallback SMTP port ${this.fallbackPort}`,
        );
        return;
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }

    throw lastError;
  }

  public async sendBookingEmail(booking: Bookings): Promise<void> {
    const { email, name, appointmentDate, appointmentTime, serviceType, phone } = booking;
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

      await this.sendMailWithReliability({
        from: getDefaultFrom(),
        to: this.normalizeEmail(email),
        bcc: this.normalizeEmail(getDefaultFrom()),
        subject: 'Welcome to Our App!',
        html,
      }, 'Booking email');
      this.logger.log(`Booking email sent to ${email}`);
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to send booking email', trace);
    }
  }

  private buildProductsTableRows(products: OrderNotificationProduct[]): string {
    if (!products.length) {
      return '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd;">No products attached</td></tr>';
    }

    return products
      .map((product) => {
        const lineTotal = product.quantity * product.unitPrice;
        return `<tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">GHS ${product.unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">GHS ${lineTotal.toFixed(2)}</td>
        </tr>`;
      })
      .join('');
  }

  private buildOrderHtml(payload: OrderNotificationPayload, audience: 'customer' | 'business'): string {
    const orderTypeLabel =
      payload.orderType === 'service_booking' ? 'Service Booking' : 'Product Purchase';
    const intro =
      audience === 'customer'
        ? 'Thank you for your order. Here is your payment confirmation.'
        : 'A new paid order has been received.';
    const paidAtText = payload.paidAt ? new Date(payload.paidAt).toLocaleString('en-US') : 'N/A';

    const bookingSection =
      payload.orderType === 'service_booking' && payload.booking
        ? `<h3>Booking Details</h3>
           <p><strong>Service:</strong> ${payload.booking.serviceType}</p>
           <p><strong>Appointment Date:</strong> ${payload.booking.appointmentDate ?? 'N/A'}</p>
           <p><strong>Appointment Time:</strong> ${payload.booking.appointmentTime ?? 'N/A'}</p>`
        : '';

    const productSection =
      payload.orderType === 'product_purchase'
        ? `<h3>Products</h3>
           <table style="border-collapse: collapse; width: 100%;">
             <thead>
               <tr>
                 <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                 <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qty</th>
                 <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Unit Price</th>
                 <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Line Total</th>
               </tr>
             </thead>
             <tbody>${this.buildProductsTableRows(payload.products)}</tbody>
           </table>`
        : '';

    const customerSection =
      audience === 'business'
        ? `<h3>Customer Details</h3>
           <p><strong>Name:</strong> ${payload.customerName ?? 'N/A'}</p>
           <p><strong>Email:</strong> ${payload.customerEmail}</p>
           <p><strong>Phone:</strong> ${payload.customerPhone ?? 'N/A'}</p>`
        : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; line-height: 1.5;">
        <h2>${orderTypeLabel} Payment Confirmation</h2>
        <p>${intro}</p>
        <p><strong>Reference:</strong> ${payload.reference}</p>
        <p><strong>Amount Paid:</strong> ${payload.currency ?? 'GHS'} ${(payload.amountPaid / 100).toFixed(2)}</p>
        <p><strong>Paid At:</strong> ${paidAtText}</p>
        <p><strong>Payment Channel:</strong> ${payload.paymentChannel ?? 'N/A'}</p>
        ${bookingSection}
        ${productSection}
        ${customerSection}
      </div>
    `;
  }

  public async sendOrderNotifications(payload: OrderNotificationPayload): Promise<void> {
    const from = getDefaultFrom();
    const customerSubject =
      payload.orderType === 'service_booking'
        ? 'Your service booking payment was received'
        : 'Your order payment was received';

    const businessSubject =
      payload.orderType === 'service_booking'
        ? 'New paid service booking received'
        : 'New paid product order received';

    try {
      await this.sendMailWithReliability({
        from,
        to: this.normalizeEmail(payload.customerEmail),
        subject: customerSubject,
        html: this.buildOrderHtml(payload, 'customer'),
      }, 'Customer order email');
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to send customer order email', trace);
    }

    const businessNotificationEmail = getDefaultFrom();
    if (!businessNotificationEmail) {
      return;
    }

    try {
      await this.sendMailWithReliability({
        from,
        to: this.normalizeEmail(businessNotificationEmail),
        subject: businessSubject,
        html: this.buildOrderHtml(payload, 'business'),
      }, 'Business order email');
    } catch (error) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to send business order email', trace);
    }
  }
}
