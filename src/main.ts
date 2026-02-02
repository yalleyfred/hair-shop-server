import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: isProduction ? 'https://hair-shop-client.vercel.app' : 'http://localhost:4200',
    methods: 'GET, POST, PATCH, PUT, DELETE',
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 2500);
}
bootstrap();
