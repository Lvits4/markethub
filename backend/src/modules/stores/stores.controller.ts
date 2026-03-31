import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Listar tiendas aprobadas' })
  findAll() {
    return this.storesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener tienda por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findById(id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener tienda por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Get('my/store')
  @ApiOperation({ summary: 'Obtener mi tienda (vendedor o admin)' })
  getMyStore(@CurrentUser() user: User) {
    return this.storesService.findByUserId(user.id);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Crear tienda (vendedor o administrador)' })
  create(@Body() dto: CreateStoreDto, @CurrentUser() user: User) {
    return this.storesService.create(dto, user);
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
}
