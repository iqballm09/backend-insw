import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
        maxAge: 60 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Set CORS options
  app.enableCors({
    origin: '*',
    credentials: true, // Izinkan kredensial (misalnya, cookies)
  });
  // ADD SWAGGER DOCUMENTATION
  const config = new DocumentBuilder()
    .setTitle('INSW API Documentation')
    .setDescription(
      'Dokumentasi API Indonesia Nasional Single Window (INSW) Berbasis Blockchain',
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
