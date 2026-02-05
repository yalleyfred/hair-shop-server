import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateServiceDto, UpdateServiceDto } from '../../../Dtos/services.dto';
import { ServiceItemsService } from '../service/services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly serviceItemsService: ServiceItemsService) {}

  @Get()
  public findAll() {
    return this.serviceItemsService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string) {
    return this.serviceItemsService.findOne(id);
  }

  @Post()
  public create(@Body() dto: CreateServiceDto) {
    return this.serviceItemsService.create(dto);
  }

  @Put(':id')
  public update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.serviceItemsService.update(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id') id: string) {
    return this.serviceItemsService.remove(id);
  }
}
