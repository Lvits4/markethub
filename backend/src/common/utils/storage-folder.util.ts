export type UploadFolderKind = 'stores' | 'products' | 'general' | 'categories';

/** Slug seguro para nombres de carpeta en disco (misma lógica que slugs de tienda). */
export function slugifyForStorage(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'sin-nombre';
}

export type BuildUploadFolderOptions = {
  /** Nombre del contenedor padre (p. ej. tienda para productos). */
  parentName?: string;
  /** Sufijo para desambiguar carpetas con el mismo nombre (número o id corto). */
  disambiguator?: string | number;
};

/**
 * Ruta relativa bajo uploads/ con carpetas legibles:
 * stores/sacha, products/sacha/camisa-azul, general/juan-perez, etc.
 */
export function buildUploadFolder(
  kind: UploadFolderKind,
  entityName: string,
  options?: BuildUploadFolderOptions,
): string {
  let segment = slugifyForStorage(entityName);
  const disambiguator = options?.disambiguator;
  if (disambiguator != null && String(disambiguator).trim() !== '') {
    segment = `${segment}-${disambiguator}`;
  }

  const parent = options?.parentName?.trim();
  if (parent) {
    const parentSlug = slugifyForStorage(parent);
    return `${kind}/${parentSlug}/${segment}`;
  }

  return `${kind}/${segment}`;
}
