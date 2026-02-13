import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { throttler } = requestProps;

    // Only apply if the throttler name matches 'email'
    if (throttler.name === 'email') {
      return super.handleRequest(requestProps);
    }
    return true; // Skip other throttlers in this guard
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.body?.email || req.ip;
  }
}
