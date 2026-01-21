import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    // origin: process.env.CORS_ORIGIN
    //   ? process.env.CORS_ORIGIN.split(',')
    //   : ['http://localhost:2000', 'http://localhost:1000'],
    origin: ['http://localhost:1000', 'http://localhost:2000'],
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = parseInt((process.env.PORT || '3000').trim(), 10);
  await app.listen(port);

  console.log(`🚀 API server running on http://localhost:${port}/api`);
}

bootstrap();
