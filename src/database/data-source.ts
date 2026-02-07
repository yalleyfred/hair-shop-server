import 'dotenv/config';
import { DataSource } from 'typeorm';
import { BookingsEntity } from '../entities/bookings.entity';
import { ProductsEntity } from '../entities/products.entity';
import { ServiceCategoryEntity } from '../entities/service-category.entity';
import { ServiceEntity } from '../entities/service.entity';
import { User } from '../entities/user.entity';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: isProduction ? process.env.DB_URL : process.env.DB_LOCAL_URL,
  entities: [BookingsEntity, ProductsEntity, ServiceCategoryEntity, ServiceEntity, User],
  migrations: [__dirname + '/../migrations/*.sql'],
  synchronize: false,
  logging: isProduction,
  ssl: isProduction,
  extra: isProduction
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {},
});
