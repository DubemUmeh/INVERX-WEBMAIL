import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  requestId: string;
  userId?: string;
  accountId?: string;
  apiKeyId?: string;
  startTime: number;
}

// Extend Express Request to include context
declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestContextMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Generate unique request ID
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Initialize request context
    req.context = {
      requestId,
      startTime: Date.now(),
    };

    // Set response header for tracing
    res.setHeader('x-request-id', requestId);

    this.logger.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
    this.logger.debug(`Query: ${JSON.stringify(req.query)}`);
    this.logger.debug(`Body: ${JSON.stringify(req.body)}`);

    next();
  }
}
