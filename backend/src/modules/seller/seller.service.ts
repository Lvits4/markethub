import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { StoresService } from '../stores/stores.service';
import { User } from '../users/entities/user.entity';
import { OrderStatus, PaymentStatus, Role } from '../../common/enums';

@Injectable()
export class SellerService {
  constructor(
    private readonly storesService: StoresService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  private assertCanAccessStore(storeId: string, user: User, storeUserId: string) {
    if (user.role === Role.ADMIN) {
      return;
    }
    if (storeUserId !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta tienda');
    }
  }

  async getDashboardStats(user: User) {
    const myStores = await this.storesService.findStoresByUserId(user.id);
    const ids = myStores.map((s) => s.id);

    if (ids.length === 0) {
      return {
        users: { total: 0, customers: 0, sellers: 0 },
        stores: { total: 0, approved: 0, rejected: 0, pending: 0 },
        products: { total: 0, active: 0 },
        orders: { total: 0, completed: 0 },
        revenue: { totalSales: 0 },
      };
    }

    const approved = myStores.filter((s) => s.isApproved).length;
    const rejected = myStores.filter((s) => s.isRejected).length;
    const pending = myStores.filter((s) => !s.isApproved && !s.isRejected).length;

    const [totalProducts, activeProducts, totalOrders, completedOrders, totalSalesResult] =
      await Promise.all([
        this.productsRepository.count({ where: { storeId: In(ids) } }),
        this.productsRepository.count({
          where: { storeId: In(ids), isActive: true },
        }),
        this.ordersRepository.count({ where: { storeId: In(ids) } }),
        this.ordersRepository.count({
          where: { storeId: In(ids), status: OrderStatus.DELIVERED },
        }),
        this.paymentsRepository
          .createQueryBuilder('payment')
          .innerJoin(Order, 'ord', 'ord.id = payment.order_id')
          .select('SUM(payment.amount)', 'total')
          .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
          .andWhere('ord.store_id IN (:...ids)', { ids })
          .getRawOne<{ total: string | null }>(),
      ]);

    return {
      users: { total: 0, customers: 0, sellers: 0 },
      stores: {
        total: ids.length,
        approved,
        rejected,
        pending,
      },
      products: { total: totalProducts, active: activeProducts },
      orders: { total: totalOrders, completed: completedOrders },
      revenue: {
        totalSales: parseFloat(String(totalSalesResult?.total ?? '0')) || 0,
      },
    };
  }

  async getMyProducts(user: User) {
    const myStores = await this.storesService.findStoresByUserId(user.id);
    const ids = myStores.map((s) => s.id);
    if (ids.length === 0) {
      return [];
    }
    return this.productsRepository.find({
      where: { storeId: In(ids) },
      relations: ['store', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStoreById(storeId: string, user: User) {
    const detail = await this.storesService.getStoreWithStats(storeId);
    this.assertCanAccessStore(storeId, user, detail.userId);
    return detail;
  }

  async getSalesReport(user: User) {
    const myStores = await this.storesService.findStoresByUserId(user.id);
    const ids = myStores.map((s) => s.id);
    if (ids.length === 0) {
      return { monthlySales: [], topStores: [] };
    }

    const monthlySales = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'totalOrders')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .andWhere('order.store_id IN (:...ids)', { ids })
      .groupBy("TO_CHAR(order.created_at, 'YYYY-MM')")
      .orderBy("TO_CHAR(order.created_at, 'YYYY-MM')", 'DESC')
      .limit(12)
      .getRawMany();

    const topStores = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.store', 'store')
      .select('store.id', 'storeId')
      .addSelect('store.name', 'storeName')
      .addSelect('COUNT(*)', 'totalOrders')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .where('order.store_id IN (:...ids)', { ids })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('store.id')
      .addGroupBy('store.name')
      .orderBy('SUM(order.total_amount)', 'DESC')
      .limit(10)
      .getRawMany();

    return { monthlySales, topStores };
  }
}
