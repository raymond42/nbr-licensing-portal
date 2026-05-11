import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('NBR Licensing Portal API')
    .setDescription('Regulatory workflow and compliance management API.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`[api] listening on port ${port}`);
}

void bootstrap();
