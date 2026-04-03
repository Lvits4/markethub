import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly storesService: StoresService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear pedido desde el carrito (Customer)' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.createFromCart(dto, user);
  }

  @Get('my')
  @ApiOperation({ summary: 'Historial de pedidos del cliente' })
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.findByUserId(user.id);
  }

  @Delete('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Limpiar historial de pedidos del cliente (oculta en la cuenta; los registros siguen en tienda/admin)',
  })
  clearMyOrders(@CurrentUser() user: User) {
    return this.ordersService.clearHistoryForUser(user.id);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @Get('store')
  @ApiOperation({
    summary:
      'Pedidos de tienda: vendedor ve los de su tienda; admin ve todos los pedidos',
  })
  async getStoreOrders(@CurrentUser() user: User) {
    if (user.role === Role.ADMIN) {
      return this.ordersService.findAllOrdersAdmin();
    }
    const stores = await this.storesService.findStoresByUserId(user.id);
    if (stores.length === 0) {
      throw new NotFoundException('No tienes tiendas registradas');
    }
    return this.ordersService.findByStoreIds(stores.map((s) => s.id));
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @Get('store/report')
  @ApiOperation({
    summary:
      'Reporte de ventas: vendedor el de su tienda; admin el agregado de la plataforma',
  })
  async getStoreReport(@CurrentUser() user: User) {
    if (user.role === Role.ADMIN) {
      return this.ordersService.getPlatformReport();
    }
    const stores = await this.storesService.findStoresByUserId(user.id);
    if (stores.length === 0) {
      throw new NotFoundException('No tienes tiendas registradas');
    }
    return this.ordersService.getSellerReportForStoreIds(stores.map((s) => s.id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findById(id, user);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del pedido (Vendedor/Admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar pedido',
    description:
      'Borrado definitivo. Admin: cualquier pedido. Vendedor: pedidos de su tienda. Comprador: solo sus pedidos.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.ordersService.remove(id, user);
  }
}
