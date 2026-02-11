import { SanitizationPipe } from './common/pipes/sanitization.pipe.js';
import { INestApplication } from '@nestjs/common';

export async function configureApp(app: INestApplication) {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim())
    : ([process.env.WEB_URL, process.env.APP_URL].filter(Boolean) as string[]);

  // Enable CORS
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Register global sanitization pipe
  app.useGlobalPipes(new SanitizationPipe());
}
