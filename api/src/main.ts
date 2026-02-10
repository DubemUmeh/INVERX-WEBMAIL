import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  await configureApp(app);

  const port = parseInt((process.env.PORT || '3000').trim(), 10);
  await app.listen(port);

  console.log(`🚀 API server running on http://localhost:${port}/api`);
}

bootstrap();
