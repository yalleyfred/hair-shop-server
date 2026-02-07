import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controller/payment.controller';
import { PaymentGateway } from './payment.gateway';
import { PaymentService } from './service/payment.service';
import { ProductsEntity } from '../../entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity])],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentGateway]
})
export class PaymentModule {}
