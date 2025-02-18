import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './module/bookings/bookings.module';
import { ProductsModule } from './module/products/products.module';
import { BookingsEntity } from './entities/bookings.entity';
import { ProductsEntity } from './entities/products.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      database: process.env.DB,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USERNAME,
      port: 5433,
      entities: [BookingsEntity, ProductsEntity],
    }),
    BookingsModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
