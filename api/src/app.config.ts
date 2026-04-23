import { SanitizationPipe } from './common/pipes/sanitization.pipe.js';
import { INestApplication } from '@nestjs/common';

export async function configureApp(app: INestApplication) {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim())
    : (
        [
          process.env.WEB_URL,
          process.env.APP_URL,
          process.env.NEXT_PUBLIC_WEB_ORIGIN,
          process.env.NEXT_PUBLIC_APP_ORIGIN,
          'https://inverx.pro',
          'https://www.inverx.pro',
          'https://app.inverx.pro',
        ].filter(Boolean) as string[]
      );

  // Enable CORS
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Fix Set-Cookie domain for cross-subdomain access in production
  if (process.env.NODE_ENV === 'production') {
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();

    expressApp.use((req: any, res: any, next: any) => {
      const originalSetHeader = res.setHeader;
      res.setHeader = function (name: string, value: any) {
        // Rewrite Set-Cookie headers to use .inverx.pro domain for better-auth cookies
        if (
          name.toLowerCase() === 'set-cookie' &&
          typeof value === 'string' &&
          value.includes('better-auth')
        ) {
          // Replace domain with .inverx.pro to enable subdomain sharing
          value = value
            .replace(/Domain=api\.inverx\.pro/gi, 'Domain=.inverx.pro')
            .replace(/domain=api\.inverx\.pro/gi, 'domain=.inverx.pro');

          console.log('[SetCookie Middleware] Rewritten cookie:', value.substring(0, 100));
        }
        return originalSetHeader.call(this, name, value);
      };
      next();
    });
  }

  // Set global prefix
  app.setGlobalPrefix('api');

  // Register global sanitization pipe
  app.useGlobalPipes(new SanitizationPipe());
}
