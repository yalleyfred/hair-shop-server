import { Module } from '@nestjs/common';
import { BookingsController } from './controller/bookings.controller';
import { BookingsService } from './service/bookings.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
