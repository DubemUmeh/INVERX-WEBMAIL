import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      typeof value === 'object' &&
      value !== null
    ) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitizedObj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/</g, '&lt;') // Escape HTML tags
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '') // Remove potential JS execution
      .replace(/on\w+=/gi, ''); // Remove onEvent handlers
  }
}
