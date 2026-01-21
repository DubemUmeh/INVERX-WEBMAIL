import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId?: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.context?.requestId;

    return next.handle().pipe(
      map((data) => {
        // If data is already in response format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract pagination from data if present
        type PaginationType = NonNullable<
          NonNullable<ApiResponse<T>['meta']>['pagination']
        >;
        let pagination: PaginationType | undefined;
        let responseData = data;

        if (data && typeof data === 'object' && 'items' in data) {
          responseData = data.items;
          if ('total' in data) {
            pagination = {
              page: data.page || 1,
              limit: data.limit || 20,
              total: data.total,
              totalPages: Math.ceil(data.total / (data.limit || 20)),
            };
          }
        }

        return {
          success: true,
          data: responseData,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            ...(pagination && { pagination }),
          },
        };
      }),
    );
  }
}
