import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
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

/** Evita fallos de `instanceof` si hubiera copias duplicadas de @nestjs/common en runtime. */
function isStreamableFileBody(data: unknown): data is StreamableFile {
  return (
    data instanceof StreamableFile ||
    (!!data &&
      typeof data === 'object' &&
      'getStream' in data &&
      typeof (data as { getStream: unknown }).getStream === 'function')
  );
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest<{
        method?: string;
        url?: string;
        originalUrl?: string;
      }>();
      const pathWithQuery = req.originalUrl ?? req.url ?? '';
      if (
        req.method === 'GET' &&
        (pathWithQuery.includes('/files/download') ||
          pathWithQuery.includes('/files/public'))
      ) {
        return next.handle() as Observable<ApiResponse<T>>;
      }
    }

    const statusCode = context.switchToHttp().getResponse().statusCode;
    return next.handle().pipe(
      map((data) => {
        if (isStreamableFileBody(data)) {
          return data as unknown as ApiResponse<T>;
        }
        // void / sin retorno → undefined; JSON.stringify omite claves undefined y el
        // cliente espera siempre `{ data }` (p. ej. DELETE que resuelve sin cuerpo útil).
        const payload =
          data === undefined
            ? null
            : stripAuditTimestamps(data, new WeakMap());
        return {
          statusCode,
          message: 'Success',
          data: payload as T,
        };
      }),
    );
  }
}
