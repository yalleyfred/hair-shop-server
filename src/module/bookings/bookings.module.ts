import { Module } from '@nestjs/common';
import { BookingsController } from './controller/bookings.controller';
import { BookingsService } from './service/bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsEntity } from '../../entities/bookings.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookingsEntity]), EmailModule],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
