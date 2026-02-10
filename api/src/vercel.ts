import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.config.js';
import express from 'express';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let app: any;

const bootstrap = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule, adapter, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    await configureApp(app);
    await app.init();
  }
  return app;
};

export default async function handler(req: any, res: any) {
  await bootstrap();

  // Vercel serverless functions need the express instance to handle the request
  expressApp(req, res);
}
