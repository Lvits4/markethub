import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { StorageService } from 's3-client-dtb/nestjs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Readable } from 'stream';

const PUBLIC_MARKET_PREFIXES = ['stores/', 'products/'] as const;

@Injectable()
export class FilesService {
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

  async upload(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<{ url: string; originalName: string }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = `${folder}/${fileName}`;

    const savedPath = await this.storage.uploadFile(
      filePath,
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
