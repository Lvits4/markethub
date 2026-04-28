/** URL base de la API (sin barra final). */
export function apiBaseTrimmed(): string {
  const v = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  const resolved =
    v || (import.meta.env.DEV ? 'http://localhost:3000/api' : '');
  return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;
}

function buildPublicFileUrl(storagePath: string): string {
  const base = apiBaseTrimmed();
  if (!base) return storagePath;
  const p = storagePath.replace(/^\/+/, '');
  return `${base}/files/public?path=${encodeURIComponent(p)}`;
}

/**
 * URL usable en `<img src>` para ficheros en `stores/*` o `products/*` vía GET público.
 * URLs http(s) absolutas se devuelven tal cual; rutas relativas del storage se resuelven contra la API.
 */
export function publicStorageImageSrc(raw: string | null | undefined): string {
  const v = (raw ?? '').trim();
  if (!v) return '';
  if (v.startsWith('blob:') || v.startsWith('data:')) return v;
  if (v.startsWith('http://') || v.startsWith('https://')) {
    try {
      const u = new URL(v);
      if (u.pathname.includes('/files/download')) {
        const pathParam = u.searchParams.get('path');
        if (pathParam) {
          return buildPublicFileUrl(pathParam);
        }
      }
      return v;
    } catch {
      return v;
    }
  }
  if (v.includes('/files/download?path=')) {
    try {
      const q = v.includes('http') ? new URL(v).searchParams.get('path') : null;
      if (q) return buildPublicFileUrl(q);
    } catch {
      /* ignore */
    }
  }
  return buildPublicFileUrl(v);
}
