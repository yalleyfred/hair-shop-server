import { Module } from '@nestjs/common';
import { BookingsController } from './controller/bookings.controller';
import { BookingsService } from './service/bookings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsEntity } from 'src/entities/bookings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookingsEntity])],
  controllers: [BookingsController],
  providers: [BookingsService, ]
})
export class BookingsModule {}
