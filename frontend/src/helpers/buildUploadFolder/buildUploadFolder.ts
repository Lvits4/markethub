export type UploadFolderKind = 'stores' | 'products' | 'general' | 'categories';

/** Slug seguro para nombres de carpeta en disco (misma lógica que en el backend). */
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
  parentName?: string;
  disambiguator?: string | number;
};

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
