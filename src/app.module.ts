import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './module/bookings/bookings.module';
import { ProductsModule } from './module/products/products.module';
import { BookingsEntity } from './entities/bookings.entity';
import { ProductsEntity } from './entities/products.entity';
import { CloudinaryService } from './services/cloudinary/cloudinary.service';
import { AuthModule } from './module/auth/auth.module';
import { UserService } from './services/user/user.service';
import { User } from './entities/user.entity';
import { EmailService } from './services/email/email.service';
import { PaymentModule } from './module/payment/payment.module';
import { ServicesModule } from './module/services/services.module';
import { ServiceCategoryEntity } from './entities/service-category.entity';
import { ServiceEntity } from './entities/service.entity';
import * as dotenv from 'dotenv';

dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: isProduction ? process.env.DB_URL: process.env.DB_LOCAL_URL,
      entities: [BookingsEntity, ProductsEntity, ServiceCategoryEntity, ServiceEntity, User],
      synchronize: !isProduction,
      logging: isProduction,
      ssl: isProduction,
      extra: isProduction
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {},
    }),
    TypeOrmModule.forFeature([User]), // Make UserRepository available
    BookingsModule,
    ProductsModule,
    AuthModule,
    PaymentModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService, UserService, EmailService],
})
export class AppModule {}
