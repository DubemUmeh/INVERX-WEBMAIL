import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    console.log(
      `[CurrentUser Decorator] Extracted User: ${user ? JSON.stringify(user) : 'UNDEFINED'}, Requested Key: ${data}`,
    );

    // If a specific property is requested, return that property
    if (data) {
      return user?.[data];
    }

    return user;
  },
);
