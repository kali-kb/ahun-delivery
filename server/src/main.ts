import * as dotenv from 'dotenv';
dotenv.config(); 

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     const allowedOrigins = [
  //       'exp://192.168.1.3:8081', // Your Expo Go URL
  //       'http://localhost:8081', // For web dev
  //     ];
  //     console.log('CORS origin:', origin || 'No origin');
  //     if (!origin || allowedOrigins.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error(`CORS blocked: ${origin}`));
  //     }
  //   },
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // })
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
