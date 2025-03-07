import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './module/bookings/bookings.module';
import { ProductsModule } from './module/products/products.module';
import { BookingsEntity } from './entities/bookings.entity';
import { ProductsEntity } from './entities/products.entity';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './services/cloudinary/cloudinary.service';
import { AuthModule } from './module/auth/auth.module';
import { UserService } from './services/user/user.service';
import { User } from './entities/user.entity';

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
      entities: [BookingsEntity, ProductsEntity, User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]), // Make UserRepository available
    BookingsModule,
    ProductsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService, UserService],
})
export class AppModule {}
