import { Module } from '@nestjs/common';
import { ProductsController } from './controller/products.controller';
import { ProductsService } from './service/products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/entities/products.entity';
import { CloudinaryService } from 'src/services/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService]
})
export class ProductsModule {}
