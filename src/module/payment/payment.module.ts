import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controller/payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentService } from './service/payment.service';
import { ProductsEntity } from '../../entities/products.entity';
import { PaymentEventEntity } from '../../entities/payment-event.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity, PaymentEventEntity]), EmailModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGateway]
})
export class PaymentModule {}
