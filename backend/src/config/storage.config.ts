import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  mode: process.env.STORAGE_MODE || 'offline',
  rootPath: process.env.STORAGE_ROOT_PATH || './uploads',
  maxFileSize: process.env.STORAGE_MAX_FILE_SIZE || '10mb',
  allowedMimeTypes: (process.env.STORAGE_ALLOWED_MIME_TYPES || 'image/*').split(','),
}));
