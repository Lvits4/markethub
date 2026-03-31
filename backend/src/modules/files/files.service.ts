import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from 's3-client-dtb/nestjs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  constructor(private readonly storage: StorageService) {}

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
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    const stream = await this.storage.downloadFile(filePath);
    return stream as unknown as Readable;
  }

  async delete(filePath: string): Promise<void> {
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    await this.storage.deleteFile(filePath);
  }

  async getMetadata(filePath: string) {
    const exists = await this.storage.fileExists(filePath);
    if (!exists) {
      throw new NotFoundException('Archivo no encontrado');
    }
    return this.storage.getFileMetadata(filePath);
  }
}
