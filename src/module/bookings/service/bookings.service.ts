import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto, UpdateBookingDto } from '../../../Dtos/bookings.dto';
import { BookingsEntity } from '../../../entities/bookings.entity';
import { EmailService } from '../../../services/email/email.service';
import { Repository } from 'typeorm';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingsEntity)
    private readonly bookingRepository: Repository<BookingsEntity>,
    private readonly emailService: EmailService,
  ) {}

  public async findAll(): Promise<BookingsEntity[]> {
    return await this.bookingRepository.find();
  }

  public async findOne(id: string): Promise<BookingsEntity | null> {
    return await this.bookingRepository.findOneBy({id});
  }

  public async create(createBookingDto: CreateBookingDto): Promise<BookingsEntity> {
    const booking = this.bookingRepository.create(createBookingDto);
    await this.emailService.sendBookingEmail(booking);
    return await this.bookingRepository.save(booking);
  }

  public async update(id: string, updateBookingDto: UpdateBookingDto) {
    return await this.bookingRepository.update(id, updateBookingDto);
  }

  public async remove(id: string) {
    return await this.bookingRepository.softDelete(id);
  }
}
