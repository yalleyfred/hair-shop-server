import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BookingsService } from '../service/bookings.service';
import { CreateBookingDto, UpdateBookingDto } from 'src/Dtos/bookings.dto';
import { Bookings } from 'src/models/bookings.model';

@Controller('bookings')
export class BookingsController {

    constructor(private readonly bookingService: BookingsService) {}
    
    @Get()
    public findAll() {
        return this.bookingService.findAll();
    }

    @Get(':id')
    public findOne(@Param('id') id: string) {
        return this.bookingService.findOne(id);
    }

    @Post()
    public create(@Body() createBookingDto: CreateBookingDto) {
        return this.bookingService.create(createBookingDto);
    }

    @Put(':id')
    public update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return this.bookingService.update(id, updateBookingDto);
    }

    @Delete(':id')
    public remove(@Body() bookings: Bookings) {
        return this.bookingService.remove(bookings);
    }
}
