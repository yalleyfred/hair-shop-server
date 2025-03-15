import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto, UpdateBookingDto } from 'src/Dtos/bookings.dto';
import { BookingsEntity } from 'src/entities/bookings.entity';
import { Bookings } from 'src/models/bookings.model';
import { EmailService } from 'src/services/email/email.service';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingsEntity)
    private readonly bookingRepository: Repository<Bookings>,
    private readonly emailService: EmailService,
  ) {}

  public async findAll(): Promise<Bookings[]> {
    return await this.bookingRepository.find();
  }

  public async findOne(id: string): Promise<Bookings | null> {
    return await this.bookingRepository.findOneBy({id});
  }

  public async create(createBookingDto: CreateBookingDto): Promise<Bookings> {
    const booking = this.bookingRepository.create(createBookingDto);
    await this.emailService.sendBookingEmail(booking);
    return await this.bookingRepository.save(booking);
  }

  public async update(id: string, updateBookingDto: UpdateBookingDto) {
    return await this.bookingRepository.update(id, updateBookingDto);
  }

  public async remove(booking: Bookings) {
    return await this.bookingRepository.softRemove(booking);
  }
}
