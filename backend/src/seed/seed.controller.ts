import { Controller, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Poblar la base de datos con datos de prueba',
    description:
      'Crea 20 usuarios (10 compradores + 10 vendedores), categorías, tiendas (5 aprobadas + 5 pendientes de moderación), productos, favoritos, carritos y pedidos. ' +
      'Solo disponible en NODE_ENV=development. Contraseña de todos los usuarios: Password123!',
  })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description: 'Si es true, elimina los datos seed previos y los vuelve a crear',
  })
  seed(@Query('force') force?: string) {
    const shouldForce = force === 'true' || force === '1';
    return this.seedService.run(shouldForce);
  }

  @Public()
  @Post('prune-products-without-images')
  @ApiOperation({
    summary: 'Eliminar productos sin imagen válida',
    description:
      'Borra productos que no tienen imagen, tienen URL vacía, archivo local inexistente o URL remota rota. Solo desarrollo.',
  })
  pruneProductsWithoutImages() {
    return this.seedService.pruneProductsWithoutValidImagesPublic();
  }
}
