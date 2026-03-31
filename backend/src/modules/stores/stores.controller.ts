import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary:
      'Listar tiendas públicas (solo activas y aprobadas; las de vendedor aparecen tras PATCH .../approve)',
  })
  findAll() {
    return this.storesService.findAll();
  }

  @Public()
  @Get('lookup/:term')
  @ApiOperation({
    summary:
      'Buscar tienda por término: UUID (id), slug o nombre exacto (sin distinguir mayúsculas)',
  })
  @ApiParam({
    name: 'term',
    description: 'Id UUID, slug o nombre de la tienda',
    example: 'mi-tienda-online',
  })
  findByTerm(@Param('term') term: string) {
    return this.storesService.findByTerm(term);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('my/store')
  @ApiOperation({ summary: 'Listar mis tiendas (todas las del usuario autenticado)' })
  getMyStore(@CurrentUser() user: User) {
    return this.storesService.findStoresByUserId(user.id);
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('rejected')
  @ApiOperation({
    summary:
      'Listar tiendas no aprobadas (pendientes o rechazadas). Aprobar con PATCH .../stores/:id/approve',
  })
  listRejected() {
    return this.storesService.findAllRejected();
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Crear tienda (vendedor o administrador)' })
  create(@Body() dto: CreateStoreDto, @CurrentUser() user: User) {
    return this.storesService.create(dto, user);
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprobar tienda (Admin)' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.approve(id);
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar tienda (Admin)' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.reject(id);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tienda' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: User,
  ) {
    return this.storesService.update(id, dto, user);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({
    summary:
      'Eliminar tienda (dueño o admin). Borra productos, pedidos asociados y datos dependientes.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.storesService.remove(id, user);
    return { message: 'Tienda eliminada correctamente' };
  }
}
