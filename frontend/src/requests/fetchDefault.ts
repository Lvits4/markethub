import type { ApiResponse } from '../types/apiResponse';

const defaultDevBase = 'http://localhost:3000/api';

const baseUrl = () => {
  const v = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const resolved =
    v ||
    (import.meta.env.DEV ? defaultDevBase : undefined);
  if (!resolved) {
    throw new Error(
      'VITE_API_BASE_URL no está definida. Crea frontend/.env (copia .env.example) o define la variable al hacer build.',
    );
  }
  return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;
};

export type FetchDefaultAuth = {
  token?: string | null;
};

export type FetchDefaultInit = FetchDefaultAuth & {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function buildUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl()}${p}`;
}

function parseBackendMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Error desconocido';
  const o = payload as Record<string, unknown>;
  const msg = o.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg) && msg.every((x) => typeof x === 'string')) {
    return msg.join(', ');
  }
  if (typeof o.error === 'string') return o.error;
  return 'Error desconocido';
}

export async function fetchDefault<T>(
  path: string,
  init: FetchDefaultInit = {},
): Promise<T> {
  const { token, method = 'GET', body, headers = {} } = init;

  const hdrs: Record<string, string> = {
    ...headers,
  };

  if (token) {
    hdrs.Authorization = `Bearer ${token}`;
  }

  let reqBody: string | undefined;
  if (body !== undefined && body !== null) {
    hdrs['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(body);
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: hdrs,
    body: reqBody,
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const message = json ? parseBackendMessage(json) : res.statusText || 'Error de red';
    throw new ApiError(message, res.status);
  }

  if (!text || json === null) {
    return undefined as T;
  }

  if (typeof json !== 'object') {
    throw new ApiError('Respuesta inválida', res.status);
  }

  const wrapped = json as ApiResponse<T>;
  if (!('data' in wrapped)) {
    throw new ApiError('Formato de respuesta inesperado', res.status);
  }

  return wrapped.data as T;
}

export type FetchFormDataInit = FetchDefaultAuth & {
  method?: string;
  formData: FormData;
};

/** Multipart: no establecer Content-Type (boundary automático). Respuesta JSON con envoltorio `{ data }`. */
export async function fetchFormData<T>(
  path: string,
  init: FetchFormDataInit,
): Promise<T> {
  const { token, method = 'POST', formData } = init;

  const hdrs: Record<string, string> = {};
  if (token) {
    hdrs.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: hdrs,
    body: formData,
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const message = json ? parseBackendMessage(json) : res.statusText || 'Error de red';
    throw new ApiError(message, res.status);
  }

  if (!text || json === null) {
    return undefined as T;
  }

  if (typeof json !== 'object') {
    throw new ApiError('Respuesta inválida', res.status);
  }

  const wrapped = json as ApiResponse<T>;
  if (!('data' in wrapped)) {
    throw new ApiError('Formato de respuesta inesperado', res.status);
  }

  return wrapped.data as T;
}
