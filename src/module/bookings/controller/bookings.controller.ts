import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BookingsService } from '../service/bookings.service';
import { CreateBookingDto, UpdateBookingDto } from 'src/Dtos/bookings.dto';
import { Bookings } from 'src/models/bookings.model';

@Controller('booking')
export class BookingsController {

    constructor(private readonly bookingService: BookingsService) {}
    
    @Get()
    public async findAll() {
        return this.bookingService.findAll();
    }

    @Get(':id')
    public async findOne(@Param('id') id: string) {
        return await this.bookingService.findOne(id);
    }

    @Post()
    public async create(@Body() createBookingDto: CreateBookingDto) {
        return await this.bookingService.create(createBookingDto);
    }

    @Put(':id')
    public async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return await this.bookingService.update(id, updateBookingDto);
    }

    @Delete(':id')
    public async remove(@Body() bookings: Bookings) {
        return await this.bookingService.remove(bookings);
    }
}
