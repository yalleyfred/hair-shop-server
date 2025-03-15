import { Module } from '@nestjs/common';
import { BookingsController } from './controller/bookings.controller';
import { BookingsService } from './service/bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsEntity } from 'src/entities/bookings.entity';
import { EmailService } from 'src/services/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingsEntity])],
  controllers: [BookingsController],
  providers: [BookingsService, EmailService]
})
export class BookingsModule {}
