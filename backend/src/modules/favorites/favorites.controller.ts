import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos favoritos' })
  findAll(@CurrentUser() user: User) {
    return this.favoritesService.findByUser(user.id);
  }

  @Get(':productId/check')
  @ApiOperation({ summary: 'Verificar si un producto está en favoritos' })
  check(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.isFavorite(user.id, productId);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Agregar producto a favoritos' })
  add(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.add(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Quitar producto de favoritos' })
  remove(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.remove(user.id, productId);
  }
}
