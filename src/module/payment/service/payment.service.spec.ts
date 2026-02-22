import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentService } from '../service/payment.service';
import { PaymentGateway } from '../payment.gateway';
import { ProductsEntity } from '../../../entities/products.entity';
import { PaymentEventEntity } from '../../../entities/payment-event.entity';
import { EmailService } from '../../../services/email/email.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    process.env.PAYSTACK_SECRET_KEY = 'test-secret-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentGateway, useValue: { emitStatus: jest.fn() } },
        { provide: EmailService, useValue: { sendOrderNotifications: jest.fn() } },
        { provide: getRepositoryToken(ProductsEntity), useValue: {} as Repository<ProductsEntity> },
        { provide: getRepositoryToken(PaymentEventEntity), useValue: { manager: { transaction: jest.fn() } } },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
