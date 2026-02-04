import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SanitizationPipe } from './common/pipes/sanitization.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const { APP_URL, WEB_URL } = process.env;

  // Enable CORS
  app.enableCors({
    origin: [WEB_URL, APP_URL],
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Register global sanitization pipe
  app.useGlobalPipes(new SanitizationPipe());

  const port = parseInt((process.env.PORT || '3000').trim(), 10);
  await app.listen(port);

  console.log(`🚀 API server running on http://localhost:${port}/api`);
}

bootstrap();
