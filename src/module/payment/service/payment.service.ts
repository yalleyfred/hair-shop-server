import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { BankTransferPaymentDto, CardPaymentDto, MobileMoneyPaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  public async initiateMobileMoneyPayment(data: MobileMoneyPaymentDto) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/charge`,
        {
          amount: data.amount * 100, // Paystack expects amount in pesewas
          email: data.email,
          mobile_money: data.mobile_money,
          reference: data.reference,
          callback_url: data.callback_url,
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = (error as { isAxiosError?: boolean; response?: { data?: any }; message?: string })
        ?.isAxiosError
        ? (error as { response?: { data?: any }; message?: string })
        : undefined;
      const responseData = axiosError?.response?.data;
      console.log('charge error', responseData || axiosError?.message || error);
      throw new HttpException(
        responseData?.message || 'Payment initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async initiateBankTransfer(data: BankTransferPaymentDto) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          amount: data.amount * 100, // Paystack expects amount in pesewas
          email: data.email,
          reference: data.reference,
          callback_url: data.callback_url,
          channels: ['bank_transfer'],
          currency: 'GHS',
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = (error as { isAxiosError?: boolean; response?: { data?: any } })?.isAxiosError
        ? (error as { response?: { data?: any } })
        : undefined;
      const responseData = axiosError?.response?.data;
      throw new HttpException(
        responseData?.message || 'Bank transfer initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async initiateCardPayment(data: CardPaymentDto) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          amount: data.amount * 100, // Paystack expects amount in pesewas
          email: data.email,
          reference: data.reference,
          callback_url: data.callback_url,
          channels: ['card'],
          currency: 'GHS',
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = (error as { isAxiosError?: boolean; response?: { data?: any } })?.isAxiosError
        ? (error as { response?: { data?: any } })
        : undefined;
      const responseData = axiosError?.response?.data;
      throw new HttpException(
        responseData?.message || 'Card payment initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = (error as { isAxiosError?: boolean; response?: { data?: any } })?.isAxiosError
        ? (error as { response?: { data?: any } })
        : undefined;
      const responseData = axiosError?.response?.data;
      throw new HttpException(
        responseData?.message || 'Payment verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getTransactionStatus(id: number) {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = (error as { isAxiosError?: boolean; response?: { data?: any } })?.isAxiosError
        ? (error as { response?: { data?: any } })
        : undefined;
      const responseData = axiosError?.response?.data;
      throw new HttpException(
        responseData?.message || 'Failed to get transaction status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async handleWebhook(payload: unknown, signature?: string) {
    if (!signature) {
      throw new HttpException('Missing Paystack signature', HttpStatus.BAD_REQUEST);
    }

    const computedSignature = createHmac('sha512', this.paystackSecretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (computedSignature !== signature) {
      throw new HttpException('Invalid Paystack signature', HttpStatus.UNAUTHORIZED);
    }

    // TODO: Persist or react to webhook events as needed.
    return { received: true };
  }
}