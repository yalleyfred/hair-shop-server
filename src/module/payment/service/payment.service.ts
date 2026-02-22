import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { PaymentGateway } from '../payment.gateway';
import {
  BankTransferPaymentDto,
  CardPaymentDto,
  MobileMoneyPaymentDto,
  PaymentMetadataDto,
  PaymentProductItemDto,
} from '../dto/payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsEntity } from '../../../entities/products.entity';
import { PaymentEventEntity } from '../../../entities/payment-event.entity';
import { In, Repository } from 'typeorm';
import { EmailService, OrderNotificationPayload } from '../../../services/email/email.service';

type OrderType = 'product_purchase' | 'service_booking';

type ExtractedOrderMetadata = {
  orderType: OrderType;
  customerName?: string | null;
  customerPhone?: string | null;
  booking?: {
    serviceType: string;
    appointmentDate?: string | null;
    appointmentTime?: string | null;
  } | null;
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private readonly gateway: PaymentGateway,
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
    @InjectRepository(PaymentEventEntity)
    private readonly paymentEventRepository: Repository<PaymentEventEntity>,
    private readonly emailService: EmailService,
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

  private async updateStockForProducts(
    items: PaymentProductItemDto[],
    productsRepository: Repository<ProductsEntity> = this.productsRepository,
  ) {
    if (!items.length) {
      return;
    }

    const requestedTotals = new Map<string, number>();
    for (const item of items) {
      const current = requestedTotals.get(item.productId) ?? 0;
      requestedTotals.set(item.productId, current + item.quantity);
    }

    const productIds = Array.from(requestedTotals.keys());
    const products = await productsRepository.findBy({ id: In(productIds) });

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

    await productsRepository.save(products);
  }

  private readNestedString(obj: unknown, path: string[]): string | null {
    let current: unknown = obj;
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in (current as Record<string, unknown>))) {
        return null;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return typeof current === 'string' && current.trim() ? current.trim() : null;
  }

  private getMoMoCustomerName(data: Record<string, unknown>): string | null {
    const customerFirstName = this.readNestedString(data, ['customer', 'first_name']);
    const customerLastName = this.readNestedString(data, ['customer', 'last_name']);
    const fullName = [customerFirstName, customerLastName].filter(Boolean).join(' ').trim();
    if (fullName) {
      return fullName;
    }

    return (
      this.readNestedString(data, ['customer', 'name']) ??
      this.readNestedString(data, ['authorization', 'account_name'])
    );
  }

  private getMoMoCustomerPhone(data: Record<string, unknown>): string | null {
    return (
      this.readNestedString(data, ['authorization', 'mobile_money_number']) ??
      this.readNestedString(data, ['customer', 'phone']) ??
      this.readNestedString(data, ['authorization', 'account_number'])
    );
  }

  private getPaystackHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.paystackSecretKey}`,
      'Content-Type': 'application/json',
    };
  }

  private buildMetadataForInitialization(
    products: PaymentProductItemDto[] | undefined,
    metadata: PaymentMetadataDto | undefined,
  ): Record<string, unknown> {
    return {
      products: products ?? [],
      orderType:
        metadata?.orderType ??
        ((products?.length ?? 0) > 0 ? 'product_purchase' : 'service_booking'),
      customerName: metadata?.customerName,
      customerPhone: metadata?.customerPhone,
      booking: metadata?.booking,
    };
  }

  private getOrderMetadata(payload: unknown): ExtractedOrderMetadata {
    const metadata = (payload as { data?: { metadata?: unknown } })?.data?.metadata;

    if (!metadata || typeof metadata !== 'object') {
      return { orderType: 'product_purchase' };
    }

    const metadataObj = metadata as {
      orderType?: unknown;
      customerName?: unknown;
      customerPhone?: unknown;
      booking?: unknown;
    };

    const orderType: OrderType =
      metadataObj.orderType === 'service_booking' ? 'service_booking' : 'product_purchase';

    const booking =
      metadataObj.booking && typeof metadataObj.booking === 'object'
        ? {
            serviceType:
              typeof (metadataObj.booking as { serviceType?: unknown }).serviceType === 'string'
                ? ((metadataObj.booking as { serviceType: string }).serviceType)
                : 'N/A',
            appointmentDate:
              typeof (metadataObj.booking as { appointmentDate?: unknown }).appointmentDate === 'string'
                ? (metadataObj.booking as { appointmentDate: string }).appointmentDate
                : null,
            appointmentTime:
              typeof (metadataObj.booking as { appointmentTime?: unknown }).appointmentTime === 'string'
                ? (metadataObj.booking as { appointmentTime: string }).appointmentTime
                : null,
          }
        : null;

    return {
      orderType,
      customerName: typeof metadataObj.customerName === 'string' ? metadataObj.customerName : null,
      customerPhone: typeof metadataObj.customerPhone === 'string' ? metadataObj.customerPhone : null,
      booking,
    };
  }

  private async buildOrderNotificationPayload(
    payload: unknown,
    productsRepository: Repository<ProductsEntity>,
  ): Promise<OrderNotificationPayload | null> {
    const data = (payload as { data?: Record<string, unknown> })?.data;
    if (!data) {
      return null;
    }

    const reference = typeof data.reference === 'string' ? data.reference : null;
    const customer = data.customer as { email?: unknown } | undefined;
    const customerEmail =
      typeof customer?.email === 'string'
        ? customer.email
        : typeof data.email === 'string'
          ? data.email
          : null;

    const amountRaw = data.amount;
    const amountPaid =
      typeof amountRaw === 'number'
        ? amountRaw
        : typeof amountRaw === 'string'
          ? Number(amountRaw)
          : NaN;

    if (!reference || !customerEmail || !Number.isFinite(amountPaid)) {
      return null;
    }

    const orderMetadata = this.getOrderMetadata(payload);
    const parsedProducts = this.getProductsFromWebhook(payload);
    const momoCustomerName = this.getMoMoCustomerName(data);
    const momoCustomerPhone = this.getMoMoCustomerPhone(data);

    let products: Array<{ id: string; name: string; quantity: number; unitPrice: number }> = [];
    if (parsedProducts.length) {
      const productIds = parsedProducts.map((product) => product.productId);
      const dbProducts = await productsRepository.findBy({ id: In(productIds) });
      const productsById = new Map(dbProducts.map((product) => [product.id, product]));
      products = parsedProducts.map((item) => {
        const dbProduct = productsById.get(item.productId);
        return {
          id: item.productId,
          name: dbProduct?.name ?? item.productId,
          quantity: item.quantity,
          unitPrice: Number(dbProduct?.price ?? 0),
        };
      });
    }

    const customerName = orderMetadata.customerName ?? momoCustomerName ?? null;
    const customerPhone = orderMetadata.customerPhone ?? momoCustomerPhone ?? null;

    return {
      orderType: orderMetadata.orderType,
      reference,
      customerEmail,
      customerName,
      customerPhone,
      amountPaid,
      currency: typeof data.currency === 'string' ? data.currency : null,
      paidAt: typeof data.paid_at === 'string' ? data.paid_at : null,
      paymentChannel: typeof data.channel === 'string' ? data.channel : null,
      products,
      booking: orderMetadata.booking,
    };
  }

  private async processSuccessfulPayment(payload: unknown): Promise<void> {
    const eventData = (payload as { data?: { reference?: string } })?.data;
    const reference = eventData?.reference;

    if (!reference) {
      return;
    }

    let shouldSendNotification = false;
    let notificationPayload: OrderNotificationPayload | null = null;

    await this.paymentEventRepository.manager.transaction(async (manager) => {
      const eventRepository = manager.getRepository(PaymentEventEntity);
      const existing = await eventRepository.findOneBy({ reference });
      if (existing) {
        return;
      }

      await eventRepository.save({
        reference,
        status: 'success',
        payload: (eventData as Record<string, unknown>) ?? null,
      });

      const products = this.getProductsFromWebhook(payload);
      const productsRepo = manager.getRepository(ProductsEntity);

      if (products.length) {
        await this.updateStockForProducts(products, productsRepo);
      }

      notificationPayload = await this.buildOrderNotificationPayload(payload, productsRepo);
      shouldSendNotification = true;
    });

    if (shouldSendNotification && notificationPayload) {
      await this.emailService.sendOrderNotifications(notificationPayload);
    }
  }

  private getProductsFromWebhook(payload: unknown): PaymentProductItemDto[] {
    const metadata = (payload as { data?: { metadata?: unknown } })?.data?.metadata;
    return this.extractProductsFromMetadata(metadata);
  }

  private extractProductsFromMetadata(metadata: unknown): PaymentProductItemDto[] {
    if (!metadata || typeof metadata !== 'object') {
      return [];
    }

    const metadataObj = metadata as {
      products?: unknown;
      custom_fields?: unknown;
    };

    const directProducts = this.parseProductsValue(metadataObj.products);
    if (directProducts.length) {
      return directProducts;
    }

    if (Array.isArray(metadataObj.custom_fields)) {
      for (const field of metadataObj.custom_fields) {
        const fieldObj = field as { variable_name?: unknown; display_name?: unknown; value?: unknown };
        const name = typeof fieldObj.variable_name === 'string'
          ? fieldObj.variable_name
          : typeof fieldObj.display_name === 'string'
            ? fieldObj.display_name
            : '';
        if (name.toLowerCase() === 'products') {
          const parsed = this.parseProductsValue(fieldObj.value);
          if (parsed.length) {
            return parsed;
          }
        }
      }
    }

    return [];
  }

  private parseProductsValue(value: unknown): PaymentProductItemDto[] {
    let parsedValue = value;

    if (typeof parsedValue === 'string') {
      try {
        parsedValue = JSON.parse(parsedValue);
      } catch {
        return [];
      }
    }

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((item) => typeof item === 'object' && item !== null)
      .map((item) => item as { productId?: unknown; quantity?: unknown })
      .map((item) => {
        const quantity =
          typeof item.quantity === 'number'
            ? item.quantity
            : typeof item.quantity === 'string'
              ? Number(item.quantity)
              : NaN;
        return {
          productId: item.productId,
          quantity,
        };
      })
      .filter(
        (item): item is { productId: string; quantity: number } =>
          typeof item.productId === 'string' && Number.isFinite(item.quantity),
      )
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));
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
          metadata: this.buildMetadataForInitialization(data.products, data.metadata),
        },
        { headers: this.getPaystackHeaders() }
      );

      return response.data;
    } catch (error) {
      const responseData = this.getAxiosResponseData(error);
      const message = this.getErrorMessage(error, 'Payment initiation failed');
      this.logger.error(`Charge initiation failed: ${message}`, JSON.stringify(responseData ?? message));
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  public async submitMobileMoneyOtp(reference: string, otp: string) {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/charge/submit_otp`,
        { reference, otp },
        { headers: this.getPaystackHeaders() }
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
          metadata: this.buildMetadataForInitialization(data.products, data.metadata),
        },
        { headers: this.getPaystackHeaders() }
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
          metadata: this.buildMetadataForInitialization(data.products, data.metadata),
        },
        { headers: this.getPaystackHeaders() }
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
        { headers: this.getPaystackHeaders() }
      );

      const responseData = response?.data as { data?: { status?: string } } | undefined;
      const status = responseData?.data?.status;
      if (status === 'success') {
        const payload = response.data as { data?: { metadata?: Record<string, unknown> } };
        if (products.length) {
          payload.data = payload.data ?? {};
          payload.data.metadata = payload.data.metadata ?? {};
          if (!Array.isArray(payload.data.metadata.products)) {
            payload.data.metadata.products = products;
          }
        }

        await this.processSuccessfulPayment(payload);
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
        { headers: this.getPaystackHeaders() }
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

    if (status === 'success' && reference) {
      await this.processSuccessfulPayment(payload);
    }

    // TODO: Persist or react to webhook events as needed.
    return { received: true };
  }
}
