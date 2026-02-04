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
          // Skip HTML escaping for bodyHtml field
          if (key === 'bodyHtml' && typeof obj[key] === 'string') {
            sanitizedObj[key] = this.sanitizeString(obj[key], true);
          } else {
            sanitizedObj[key] = this.sanitizeObject(obj[key]);
          }
        }
      }
      return sanitizedObj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    return obj;
  }

  private sanitizeString(str: string, skipHtmlEscaping = false): string {
    let sanitized = str.trim();

    if (!skipHtmlEscaping) {
      sanitized = sanitized
        .replace(/</g, '&lt;') // Escape HTML tags
        .replace(/>/g, '&gt;');
    }

    return sanitized
      .replace(/javascript:/gi, '') // Remove potential JS execution
      .replace(/on\w+=/gi, ''); // Remove onEvent handlers
  }
}
