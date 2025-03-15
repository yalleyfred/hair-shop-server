import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './module/bookings/bookings.module';
import { ProductsModule } from './module/products/products.module';
import { BookingsEntity } from './entities/bookings.entity';
import { ProductsEntity } from './entities/products.entity';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './services/cloudinary/cloudinary.service';
import { AuthModule } from './module/auth/auth.module';
import { UserService } from './services/user/user.service';
import { User } from './entities/user.entity';
import { EmailService } from './services/email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './mailer.config';
import { PaymentModule } from './module/payment/payment.module';

@Module({
  imports: [
    MailerModule.forRoot(mailerConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [BookingsEntity, ProductsEntity, User],
      synchronize: true,
      logging: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    TypeOrmModule.forFeature([User]), // Make UserRepository available
    BookingsModule,
    ProductsModule,
    AuthModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService, UserService, EmailService],
})
export class AppModule {}
