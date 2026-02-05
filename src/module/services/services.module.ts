import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryEntity } from '../../entities/service-category.entity';
import { ServiceEntity } from '../../entities/service.entity';
import { ServiceCategoriesController } from './controller/service-categories.controller';
import { ServicesController } from './controller/services.controller';
import { ServiceCategoriesService } from './service/service-categories.service';
import { ServiceItemsService } from './service/services.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategoryEntity, ServiceEntity])],
  controllers: [ServiceCategoriesController, ServicesController],
  providers: [ServiceCategoriesService, ServiceItemsService],
})
export class ServicesModule {}
