import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Authentication & Session
  app.use(
    session({
      secret: 'secret', // to sign session id
      resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
      saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
      rolling: true, // keep session alive
      cookie: {
        maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Set CORS options
  app.enableCors({
    origin: '*',
    credentials: true, // Izinkan kredensial (misalnya, cookies)
  });
  // ADD SWAGGER DOCUMENTATION
  const config = new DocumentBuilder()
    .setTitle('INSW API Documentation')
    .setDescription(
      'API Documentation of Indonesia Nasional Single Window (INSW) Berbasis Blockchain',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      name: 'Bearer Token',
    })
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.API_PORT);
}
bootstrap();
