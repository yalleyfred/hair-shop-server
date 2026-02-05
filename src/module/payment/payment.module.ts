import { Module } from '@nestjs/common';
import { PaymentController } from './controller/payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentService } from './service/payment.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGateway]
})
export class PaymentModule {}
