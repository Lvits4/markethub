import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const AUDIT_TIMESTAMP_KEYS = new Set([
  'createdAt',
  'updatedAt',
  'created_at',
  'updated_at',
]);

function stripAuditTimestamps(
  value: unknown,
  memo: WeakMap<object, unknown>,
): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripAuditTimestamps(item, memo));
  }
  if (memo.has(value)) {
    return memo.get(value);
  }
  const result: Record<string, unknown> = {};
  memo.set(value, result);
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (AUDIT_TIMESTAMP_KEYS.has(key)) {
      continue;
    }
    result[key] = stripAuditTimestamps(child, memo);
  }
  return result;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'Success',
        data: stripAuditTimestamps(data, new WeakMap()) as T,
      })),
    );
  }
}
