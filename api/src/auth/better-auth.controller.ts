import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/index.js';

@Controller('auth')
export class BetterAuthController {
  private readonly logger = new Logger(BetterAuthController.name);

  @Public()
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    this.logger.log(`BetterAuth Request: ${req.method} ${req.originalUrl}`);
    if (req.method === 'POST') {
      this.logger.debug(`Auth Body: ${JSON.stringify(req.body)}`);
    }
    return toNodeHandler(auth)(req, res);
  }
}
