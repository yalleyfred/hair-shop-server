import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { PaymentGateway } from '../payment.gateway';
import { BankTransferPaymentDto, CardPaymentDto, MobileMoneyPaymentDto, PaymentProductItemDto } from '../dto/payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsEntity } from '../../../entities/products.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private readonly gateway: PaymentGateway,
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
  ) {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  private getAxiosResponseData(error: unknown): unknown | undefined {
    const axiosError = error as { isAxiosError?: boolean; response?: { data?: unknown } };
    return axiosError?.isAxiosError ? axiosError.response?.data : undefined;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const responseData = this.getAxiosResponseData(error);
    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof (responseData as { message?: unknown }).message === 'string'
    ) {
      return (responseData as { message: string }).message;
    }

    if (typeof (error as { message?: unknown })?.message === 'string') {
      return (error as { message: string }).message;
    }

    return fallback;
  }

  private normalizeMobileMoneyProvider(provider: string): string {
    const normalized = provider.trim().toLowerCase();
    const aliases: Record<string, string> = {
      vodaphone: 'vodafone',
      'vodafone cash': 'vodafone',
      'vodafone-cash': 'vodafone',
      'mtn momo': 'mtn',
      airtel: 'airtel',
      tigo: 'tigo',
    };

    return aliases[normalized] ?? normalized;
  }

  private async updateStockForProducts(items: PaymentProductItemDto[]) {
    if (!items.length) {
      return;
    }

    const requestedTotals = new Map<string, number>();
    for (const item of items) {
      const current = requestedTotals.get(item.productId) ?? 0;
      requestedTotals.set(item.productId, current + item.quantity);
    }

    const productIds = Array.from(requestedTotals.keys());
    const products = await this.productsRepository.findBy({ id: In(productIds) });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new HttpException(
        { message: 'Some products were not found', missingProductIds: missing },
        HttpStatus.BAD_REQUEST,
      );
    }

    const insufficient = [] as { productId: string; available: number; requested: number }[];
    for (const product of products) {
      const requested = requestedTotals.get(product.id) ?? 0;
      if (product.quantity < requested) {
        insufficient.push({
          productId: product.id,
          available: product.quantity,
          requested,
        });
      }
    }

    if (insufficient.length) {
      throw new HttpException(
        { message: 'Insufficient stock', items: insufficient },
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const product of products) {
      const requested = requestedTotals.get(product.id) ?? 0;
      product.quantity -= requested;
    }

    await this.productsRepository.save(products);
  }

  public async initiateMobileMoneyPayment(data: MobileMoneyPaymentDto) {
    try {
      const mobileMoney = {
        ...data.mobile_money,
        provider: this.normalizeMobileMoneyProvider(data.mobile_money.provider),
      };

      const response = await axios.post(
        `${this.paystackBaseUrl}/charge`,
        {
          amount: data.amount * 100, // Paystack expects amount in pesewas
          email: data.email,
          currency: 'GHS',
          mobile_money: mobileMoney,
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
      const responseData = this.getAxiosResponseData(error);
      const message = this.getErrorMessage(error, 'Payment initiation failed');
      console.log('charge error', responseData ?? message);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async submitMobileMoneyOtp(reference: string, otp: string) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/charge/submit_otp`,
        { reference, otp },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error, 'OTP submission failed');
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
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
      const message = this.getErrorMessage(error, 'Bank transfer initiation failed');
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
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
      const message = this.getErrorMessage(error, 'Card payment initiation failed');
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async verifyPayment(reference: string, products: PaymentProductItemDto[] = []) {
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

      const responseData = response?.data as { data?: { status?: string } } | undefined;
      const status = responseData?.data?.status;
      if (status === 'success' && products.length) {
        await this.updateStockForProducts(products);
      }

      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error, 'Payment verification failed');
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
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
      const message = this.getErrorMessage(error, 'Failed to get transaction status');
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
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

    const eventData = (payload as { data?: { reference?: string; status?: string } })?.data;
    const reference = eventData?.reference;
    const status = eventData?.status;

    if (reference && status) {
      this.gateway.emitStatus(reference, status, eventData);
    }

    // TODO: Persist or react to webhook events as needed.
    return { received: true };
  }
}