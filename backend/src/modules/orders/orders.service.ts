import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { CartService } from '../cart/cart.service';
import { PaymentsService } from '../payments/payments.service';
import { User } from '../users/entities/user.entity';
import { OrderStatus, PaymentStatus, Role } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async createFromCart(dto: CreateOrderDto, user: User): Promise<Order[]> {
    const summary = await this.cartService.getCartSummary(user.id);

    if (summary.stores.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const orders: Order[] = [];

    for (const storeGroup of summary.stores) {
      const order = this.ordersRepository.create({
        userId: user.id,
        storeId: storeGroup.storeId,
        totalAmount: storeGroup.subtotal,
        shippingAddress: dto.shippingAddress,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await this.ordersRepository.save(order);

      const orderItems = storeGroup.items.map((item: any) =>
        this.orderItemsRepository.create({
          orderId: savedOrder.id,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        }),
      );

      await this.orderItemsRepository.save(orderItems);

      const payment = await this.paymentsService.processPayment(
        savedOrder.id,
        storeGroup.subtotal,
      );

      if (payment.status === PaymentStatus.COMPLETED) {
        savedOrder.status = OrderStatus.CONFIRMED;
        await this.ordersRepository.save(savedOrder);
      }

      orders.push(savedOrder);
    }

    await this.cartService.clearCart(user.id);

    return this.findByUserId(user.id);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStoreId(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { storeId },
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'store', 'user'],
    });
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    user: User,
  ): Promise<Order> {
    const order = await this.findById(id);

    if (user.role === Role.SELLER) {
      const store = order.store;
      if (store.userId !== user.id) {
        throw new ForbiddenException('No tienes permiso para actualizar este pedido');
      }
    } else if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para actualizar pedidos');
    }

    order.status = dto.status;
    return this.ordersRepository.save(order);
  }

  async getSellerReport(storeId: string) {
    const orders = await this.ordersRepository.find({
      where: { storeId },
      relations: ['items', 'items.product'],
    });

    const totalSales = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === OrderStatus.DELIVERED,
    ).length;

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId;
        if (!productSales[key]) {
          productSales[key] = {
            name: item.product?.name || 'Producto',
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += Number(item.unitPrice) * item.quantity;
      }
    }

    return {
      totalSales,
      totalOrders,
      completedOrders,
      pendingOrders: totalOrders - completedOrders,
      productSales: Object.values(productSales).sort(
        (a, b) => b.revenue - a.revenue,
      ),
    };
  }
}
