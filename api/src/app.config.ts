import { SanitizationPipe } from './common/pipes/sanitization.pipe.js';
import { INestApplication } from '@nestjs/common';

export async function configureApp(app: INestApplication) {
  const { APP_URL, WEB_URL, CORS_ORIGIN } = process.env;

  const origins = CORS_ORIGIN
    ? CORS_ORIGIN.split(',').map((url) => url.trim())
    : [WEB_URL, APP_URL];

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
