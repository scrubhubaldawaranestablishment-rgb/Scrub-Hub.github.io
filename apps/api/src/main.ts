import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = app.get(ConfigService);
  const port = Number(process.env.PORT || config.get('API_PORT', 4000));
  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  const origins = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

  // Allow Vercel preview and production URLs when deployed
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  console.log(`CreatorPilot API running on http://localhost:${port}/api`);
}

bootstrap();
