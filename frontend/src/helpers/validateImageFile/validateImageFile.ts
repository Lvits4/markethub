/** Debe coincidir con STORAGE_MAX_FILE_SIZE del backend (por defecto 20mb). */
export const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;

export function validateImageFileSize(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'El archivo debe ser una imagen';
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return 'La imagen no puede superar 20 MB';
  }
  return null;
}
