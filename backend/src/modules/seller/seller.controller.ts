import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Seller')
@ApiBearerAuth('access-token')
@Roles(Role.SELLER, Role.ADMIN)
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Estadísticas del panel para las tiendas del vendedor' })
  @ApiQuery({ name: 'lowStockThreshold', required: false, type: Number, description: 'Umbral de stock bajo (default 5)' })
  getDashboard(
    @CurrentUser() user: User,
    @Query('lowStockThreshold') lowStockThreshold?: string,
  ) {
    const threshold = lowStockThreshold ? parseInt(lowStockThreshold, 10) : 5;
    return this.sellerService.getDashboardStats(user, isNaN(threshold) ? 5 : threshold);
  }

  @Get('products')
  @ApiOperation({
    summary: 'Listar productos de las tiendas del vendedor (activos e inactivos)',
  })
  getProducts(@CurrentUser() user: User) {
    return this.sellerService.getMyProducts(user);
  }

  @Get('stores/:id')
  @ApiOperation({ summary: 'Detalle de una tienda propia con estadísticas' })
  getStore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.getStoreById(id, user);
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Informe de ventas mensual y por tienda (solo tiendas propias)' })
  getSalesReport(@CurrentUser() user: User) {
    return this.sellerService.getSalesReport(user);
  }

  @Get('ventas')
  @ApiOperation({ summary: 'Tabla de ventas por tienda del vendedor con comisiones y ganancias' })
  getVentas(@CurrentUser() user: User) {
    return this.sellerService.getVentas(user);
  }
}
