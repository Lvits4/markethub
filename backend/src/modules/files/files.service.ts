import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { StorageService } from 's3-client-dtb/nestjs';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

const PUBLIC_MARKET_PREFIXES = ['stores/', 'products/'] as const;
const MANAGED_STORAGE_PREFIXES = [
  'stores/',
  'products/',
  'general/',
  'categories/',
] as const;

const MANAGED_STORAGE_ROOTS = MANAGED_STORAGE_PREFIXES.map((p) =>
  p.replace(/\/$/, ''),
);

/** Segmentos de carpeta: letras, números, guiones (slug legible). */
const SAFE_FOLDER_SEGMENT = /^[a-z0-9][a-z0-9-]*$/i;

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly storage: StorageService) {}

  /** Rutas de almacenamiento visibles en catálogo / tiendas públicas (sin credenciales). */
  private assertPublicMarketplacePath(filePath: string | undefined): string {
    const p = this.assertPath(filePath);
    const normalized = p.replace(/^\/+/, '');
    if (
      normalized.includes('..') ||
      normalized.includes('\\') ||
      normalized.includes('\0')
    ) {
      throw new BadRequestException('Ruta de archivo inválida');
    }
    const allowed = PUBLIC_MARKET_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix),
    );
    if (!allowed) {
      throw new ForbiddenException(
        'Este archivo no está disponible de forma pública',
      );
    }
    return normalized;
  }

  async downloadPublicMarketplace(filePath: string) {
    const safe = this.assertPublicMarketplacePath(filePath);
    return this.download(safe);
  }

  private assertPath(filePath: string | undefined): string {
    if (filePath === undefined || filePath === null || String(filePath).trim() === '') {
      throw new BadRequestException('El parámetro path es obligatorio');
    }
    return String(filePath).trim();
  }

  /** Convierte una URL o ruta guardada en BD a path relativo bajo uploads/. */
  normalizeStoragePath(value: string | null | undefined): string | null {
    if (value == null) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const u = new URL(trimmed);
        const pathParam = u.searchParams.get('path');
        if (pathParam) {
          return this.normalizeStoragePath(pathParam);
        }
      } catch {
        return null;
      }
      return null;
    }

    if (trimmed.includes('/files/download?path=') || trimmed.includes('/files/public?path=')) {
      try {
        const q = trimmed.startsWith('http')
          ? new URL(trimmed).searchParams.get('path')
          : trimmed.split('path=')[1]?.split('&')[0];
        if (q) {
          return this.normalizeStoragePath(decodeURIComponent(q));
        }
      } catch {
        return null;
      }
    }

    const normalized = trimmed.replace(/^\/+/, '');
    if (
      normalized.includes('..') ||
      normalized.includes('\\') ||
      normalized.includes('\0')
    ) {
      return null;
    }

    const isManaged = MANAGED_STORAGE_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix),
    );
    return isManaged ? normalized : null;
  }

  /** Borra del disco sin fallar si el archivo ya no existe (limpieza en cascada). */
  async deleteStoredFileSafe(filePath: string | null | undefined): Promise<void> {
    const safePath = this.normalizeStoragePath(filePath);
    if (!safePath) return;

    try {
      const exists = await this.storage.fileExists(safePath);
      if (!exists) return;
      await this.storage.deleteFile(safePath);
      this.pruneEmptyParentDirs(safePath);
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar el archivo "${safePath}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private pruneEmptyParentDirs(relativeFilePath: string): void {
    const root = path.resolve(process.env.STORAGE_ROOT_PATH || './uploads');
    let current = path.dirname(relativeFilePath.replace(/\\/g, '/'));

    while (current && current !== '.') {
      const isManagedRoot = MANAGED_STORAGE_PREFIXES.some(
        (prefix) => current === prefix.replace(/\/$/, ''),
      );
      if (isManagedRoot) break;

      const fullDir = path.join(root, current);
      try {
        if (!fs.existsSync(fullDir) || !fs.statSync(fullDir).isDirectory()) {
          break;
        }
        if (fs.readdirSync(fullDir).length > 0) break;
        fs.rmdirSync(fullDir);
        current = path.dirname(current);
      } catch {
        break;
      }
    }
  }

  private sanitizeUploadFolder(folder: string): string {
    const normalized = folder
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/\\/g, '/');
    if (
      !normalized ||
      normalized.includes('..') ||
      normalized.includes('\0')
    ) {
      throw new BadRequestException('Carpeta de subida inválida');
    }

    const segments = normalized.split('/').filter(Boolean);
    if (segments.length === 0) {
      throw new BadRequestException('Carpeta de subida inválida');
    }

    const [root, ...rest] = segments;
    if (!MANAGED_STORAGE_ROOTS.includes(root)) {
      throw new BadRequestException('Prefijo de carpeta no permitido');
    }

    for (const segment of rest) {
      if (!SAFE_FOLDER_SEGMENT.test(segment)) {
        throw new BadRequestException('Carpeta de subida inválida');
      }
    }

    return segments.join('/');
  }

  async deleteStoredFilesSafe(
    paths: Iterable<string | null | undefined>,
  ): Promise<void> {
    const unique = new Set<string>();
    for (const raw of paths) {
      const normalized = this.normalizeStoragePath(raw);
      if (normalized) unique.add(normalized);
    }
    await Promise.all(
      [...unique].map((filePath) => this.deleteStoredFileSafe(filePath)),
    );
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<{ url: string; originalName: string }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const uploadFolder = this.sanitizeUploadFolder(folder);
    // La librería de storage genera el nombre único; solo debe recibir la carpeta.
    // Si se pasa "stores/uuid.jpeg", crea un directorio con extensión y rutas anidadas rotas.
    const savedPath = await this.storage.uploadFile(
      uploadFolder,
      file.buffer,
      file.mimetype,
    );

    return {
      url: savedPath,
      originalName: file.originalname,
    };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = 'general',
  ) {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async download(filePath: string): Promise<Readable> {
    filePath = this.assertPath(filePath);
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    const wrapped = await this.storage.downloadFile(filePath);
    // `StorageService.downloadFile` ya devuelve `StreamableFile`; el controlador
    // vuelve a envolver en `new StreamableFile(...)`. Anidar StreamableFile deja
    // el stream interno indefinido y rompe GET /files/download (p. ej. imágenes en panel admin).
    if (wrapped instanceof StreamableFile) {
      return wrapped.getStream();
    }
    return wrapped as Readable;
  }

  async delete(filePath: string): Promise<void> {
    filePath = this.assertPath(filePath);
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    await this.storage.deleteFile(filePath);
  }

  async getMetadata(filePath: string) {
    filePath = this.assertPath(filePath);
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return this.storage.getFileMetadata(filePath);
  }
}
