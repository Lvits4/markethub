import { useEffect, useRef, useState } from 'react';

function apiBaseTrimmed(): string {
  const v = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const resolved =
    v ||
    (import.meta.env.DEV ? 'http://localhost:3000/api' : '');
  return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;
}

/** URL absoluta para pedir el binario (con Authorization si hace falta). */
export function absoluteFileFetchUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  if (
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('blob:') ||
    v.startsWith('data:')
  ) {
    return v;
  }
  const base = apiBaseTrimmed();
  if (!base) return v;
  if (v.includes('/files/download?path=')) {
    if (v.startsWith('/')) return `${base}${v}`;
    return `${base}/${v}`;
  }
  if (v.startsWith('/')) return `${base}${v}`;
  return `${base}/files/download?path=${encodeURIComponent(v)}`;
}

/**
 * Resuelve rutas de ficheros privados (p. ej. stores/…) a un object URL con fetch + Bearer.
 * No usar la URL de download directamente en <img> si el backend exige JWT.
 */
export function useProtectedImageSrc(
  raw: string | null | undefined,
  token: string | null | undefined,
): { src: string; loading: boolean; error: boolean } {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const blobRef = useRef<string>('');

  const trimmed = (raw ?? '').trim();

  useEffect(() => {
    const revoke = () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = '';
      }
    };

    let cancelled = false;
    revoke();
    setError(false);

    if (!trimmed) {
      setSrc('');
      setLoading(false);
      return;
    }

    if (
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://')
    ) {
      setSrc(trimmed);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const abs = absoluteFileFetchUrl(trimmed);
    if (!abs) {
      setSrc('');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!token) {
      setSrc('');
      setLoading(false);
      setError(true);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setSrc('');

    void (async () => {
      try {
        const res = await fetch(abs, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          setError(true);
          setLoading(false);
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;
        const u = URL.createObjectURL(blob);
        blobRef.current = u;
        setSrc(u);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      revoke();
    };
  }, [trimmed, token]);

  return { src, loading, error };
}
