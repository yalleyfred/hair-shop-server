import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
  }

  public async initiateMobileMoneyPayment(data: {
    amount: number;
    email: string;
    mobile_money: {
      phone: string;
      provider: string; // MTN, VODAFONE, AIRTEL
    };
    reference?: string;
    callback_url?: string;
  }) {
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
        console.log('charge error', error.response.data)
      throw new HttpException(
        error.response?.data?.message || 'Payment initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async initiateBankTransfer(data: {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
  }) {
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
      throw new HttpException(
        error.response?.data?.message || 'Bank transfer initiation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async initiateCardPayment(data: {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
  }) {
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
      throw new HttpException(
        error.response?.data?.message || 'Card payment initiation failed',
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
      throw new HttpException(
        error.response?.data?.message || 'Payment verification failed',
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
      throw new HttpException(
        error.response?.data?.message || 'Failed to get transaction status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}