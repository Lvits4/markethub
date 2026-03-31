import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { UpdateCommissionDto } from './dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard con estadísticas globales' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: 'Activar/desactivar usuario' })
  toggleUserActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('stores')
  @ApiOperation({ summary: 'Listar todas las tiendas' })
  getAllStores() {
    return this.adminService.getAllStores();
  }

  @Patch('stores/:id/commission')
  @ApiOperation({ summary: 'Actualizar comisión de una tienda' })
  updateCommission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommissionDto,
  ) {
    return this.adminService.updateStoreCommission(id, dto.commission);
  }

  @Get('products')
  @ApiOperation({ summary: 'Listar todos los productos' })
  getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Listar todos los pedidos' })
  getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Reporte de ventas mensuales y top tiendas' })
  getSalesReport() {
    return this.adminService.getSalesReport();
  }
}
