import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto, UpdateBookingDto } from 'src/Dtos/bookings.dto';
import { BookingsEntity } from 'src/entities/bookings.entity';
import { Bookings } from 'src/models/bookings.model';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingsEntity)
    private readonly bookingRepository: Repository<Bookings>,
  ) {}

  public async findAll(): Promise<Bookings[]> {
    return await this.bookingRepository.find();
  }

  public async findOne(id: string): Promise<Bookings | null> {
    return await this.bookingRepository.findOneBy({id});
  }

  public async create(createBookingDto: CreateBookingDto): Promise<Bookings> {
    const booking = this.bookingRepository.create(createBookingDto);
    return await this.bookingRepository.save(booking);
  }

  public async update(id: string, updateBookingDto: UpdateBookingDto) {
    return await this.bookingRepository.update(id, updateBookingDto);
  }

  public async remove(booking: Bookings) {
    return await this.bookingRepository.softRemove(booking);
  }
}
