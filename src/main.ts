import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // Set CORS options
  app.enableCors({
    origin: '*',
    credentials: true, // Izinkan kredensial (misalnya, cookies)
  });
  await app.listen(process.env.API_PORT);
}
bootstrap();
