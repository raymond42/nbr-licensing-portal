import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SWAGGER_JWT_AUTH } from './common/swagger.constants';

function registerLegacySwaggerRedirects(app: INestApplication): void {
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType() !== 'express') {
    return;
  }
  const expressApp = httpAdapter.getInstance();
  expressApp.get('/docs', (_req: Request, res: Response) => {
    res.redirect(301, '/api/docs');
  });
  expressApp.get('/docs-json', (_req: Request, res: Response) => {
    res.redirect(301, '/api/docs-json');
  });
}

function registerRootHealthCheck(app: INestApplication): void {
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType() !== 'express') {
    return;
  }
  const expressApp = httpAdapter.getInstance();
  expressApp.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
}

function resolveCorsOrigins(config: ConfigService): string[] {
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const rawOrigins = config.get<string>('CORS_ORIGIN', frontendUrl);
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([frontendUrl, ...origins]));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: resolveCorsOrigins(config),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NBR Licensing Portal API')
    .setDescription(
      'Regulatory workflow and compliance API. JSON routes and this Swagger UI share the `/api` prefix. Obtain a Bearer token via `POST /api/auth/login`, then click Authorize.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste accessToken from the login response',
      },
      SWAGGER_JWT_AUTH,
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  registerLegacySwaggerRedirects(app);
  registerRootHealthCheck(app);

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`[api] listening on port ${port}`);
}

void bootstrap();
