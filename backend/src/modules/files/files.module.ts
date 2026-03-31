import { Module } from '@nestjs/common';
import { StorageModule } from 's3-client-dtb/nestjs';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [
    StorageModule.forRoot({
      rootPath: process.env.STORAGE_ROOT_PATH || './uploads',
      maxFileSize: process.env.STORAGE_MAX_FILE_SIZE || '10mb',
      allowedMimeTypes: (process.env.STORAGE_ALLOWED_MIME_TYPES || 'image/*').split(','),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
