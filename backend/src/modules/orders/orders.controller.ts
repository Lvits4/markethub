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

  @Roles(Role.SELLER)
  @Get('store')
  @ApiOperation({ summary: 'Pedidos recibidos en mi tienda (Vendedor)' })
  async getStoreOrders(@CurrentUser() user: User) {
    const store = await this.storesService.findByUserId(user.id);
    return this.ordersService.findByStoreId(store.id);
  }

  @Roles(Role.SELLER)
  @Get('store/report')
  @ApiOperation({ summary: 'Reporte de ventas de mi tienda (Vendedor)' })
  async getStoreReport(@CurrentUser() user: User) {
    const store = await this.storesService.findByUserId(user.id);
    return this.ordersService.getSellerReport(store.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
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
}
