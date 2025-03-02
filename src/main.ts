import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';


// Load .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET, POST, PATCH, PUT, DELETE',
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
