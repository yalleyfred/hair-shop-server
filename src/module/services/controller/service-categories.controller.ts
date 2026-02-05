import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from '../../../Dtos/services.dto';
import { ServiceCategoriesService } from '../service/service-categories.service';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Get()
  public findAll() {
    return this.serviceCategoriesService.findAll();
  }

  @Get(':id')
  public findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(id);
  }

  @Post()
  public create(@Body() dto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(dto);
  }

  @Put(':id')
  public update(@Param('id') id: string, @Body() dto: UpdateServiceCategoryDto) {
    return this.serviceCategoriesService.update(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }
}
