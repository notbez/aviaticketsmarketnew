import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * Application bootstrap and initialization
 * Configures NestJS app with validation, CORS, Swagger documentation, and starts the server
 * TODO: Add helmet for security headers and rate limiting middleware
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipeline for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Aviatickets API')
    .setDescription('Demo backend for flight search and booking (mock data)')
    .setVersion('0.1')
    .build();

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server started: http://localhost:${port}/api`);
}

bootstrap();