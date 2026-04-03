import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth('access-token')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir un archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.filesService.upload(file, folder);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Subir múltiples archivos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    return this.filesService.uploadMultiple(files, folder);
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary:
      'Descargar imagen de tienda o producto (público; solo rutas stores/* y products/*)',
  })
  @ApiQuery({ name: 'path', required: true })
  async publicDownload(@Query('path') filePath: string): Promise<StreamableFile> {
    const readable = await this.filesService.downloadPublicMarketplace(filePath);
    return new StreamableFile(readable);
  }

  @Get('download')
  @ApiOperation({ summary: 'Descargar un archivo' })
  @ApiQuery({ name: 'path', required: true })
  async download(@Query('path') filePath: string): Promise<StreamableFile> {
    const readable = await this.filesService.download(filePath);
    return new StreamableFile(readable);
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Obtener metadata de un archivo' })
  @ApiQuery({ name: 'path', required: true })
  async getMetadata(@Query('path') filePath: string) {
    return this.filesService.getMetadata(filePath);
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar un archivo' })
  @ApiQuery({ name: 'path', required: true })
  async delete(@Query('path') filePath: string) {
    await this.filesService.delete(filePath);
    return { message: 'Archivo eliminado correctamente' };
  }
}
