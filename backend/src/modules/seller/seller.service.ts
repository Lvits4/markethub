import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Store } from '../stores/entities/store.entity';
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
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  private assertCanAccessStore(storeId: string, user: User, storeUserId: string) {
    if (user.role === Role.ADMIN) {
      return;
    }
    if (storeUserId !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver esta tienda');
    }
  }

  async getDashboardStats(user: User, lowStockThreshold = 5) {
    const myStores = await this.storesService.findStoresByUserId(user.id);
    const ids = myStores.map((s) => s.id);

    if (ids.length === 0) {
      return {
        salesCount: 0,
        sellerEarnings: 0,
        commissionOwed: 0,
        totalProducts: 0,
        lowStockCount: 0,
        dailyOrders: [],
        monthlySales: [],
        topStoresByEarnings: [],
      };
    }

    const storeCommissionMap = new Map<string, number>();
    for (const s of myStores) {
      storeCommissionMap.set(s.id, Number(s.commission));
    }

    const [
      totalOrders,
      totalSalesResult,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      this.ordersRepository.count({
        where: { storeId: In(ids), status: Not(OrderStatus.CANCELLED) },
      }),
      this.ordersRepository
        .createQueryBuilder('order')
        .select('SUM(order.total_amount)', 'total')
        .where('order.store_id IN (:...ids)', { ids })
        .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
        .getRawOne<{ total: string | null }>(),
      this.productsRepository.count({ where: { storeId: In(ids) } }),
      this.productsRepository.count({
        where: { storeId: In(ids), stock: LessThanOrEqual(lowStockThreshold), isActive: true },
      }),
    ]);

    const totalSales = parseFloat(String(totalSalesResult?.total ?? '0')) || 0;

    let sellerEarnings = 0;
    let commissionOwed = 0;

    const storeSalesResults = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.store_id', 'storeId')
      .addSelect('SUM(order.total_amount)', 'storeTotal')
      .where('order.store_id IN (:...ids)', { ids })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('order.store_id')
      .getRawMany<{ storeId: string; storeTotal: string }>();

    for (const row of storeSalesResults) {
      const storeTotal = parseFloat(row.storeTotal) || 0;
      const commission = storeCommissionMap.get(row.storeId) ?? 5;
      const commAmount = storeTotal * (commission / 100);
      commissionOwed += commAmount;
      sellerEarnings += storeTotal - commAmount;
    }

    const dailyOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.store_id IN (:...ids)', { ids })
      .groupBy("TO_CHAR(order.created_at, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(order.created_at, 'YYYY-MM-DD')", 'DESC')
      .limit(30)
      .getRawMany();

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

    const topStoresRaw = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.store', 'store')
      .select('store.id', 'storeId')
      .addSelect('store.name', 'storeName')
      .addSelect('store.commission', 'commission')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .where('order.store_id IN (:...ids)', { ids })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('store.id')
      .addGroupBy('store.name')
      .addGroupBy('store.commission')
      .orderBy('SUM(order.total_amount)', 'DESC')
      .limit(10)
      .getRawMany();

    const topStoresByEarnings = topStoresRaw.map((row: any) => {
      const revenue = parseFloat(row.totalRevenue) || 0;
      const commission = parseFloat(row.commission) || 5;
      const adminEarning = revenue * (commission / 100);
      return {
        storeId: row.storeId,
        storeName: row.storeName,
        commission,
        totalRevenue: revenue,
        sellerEarnings: revenue - adminEarning,
        adminEarnings: adminEarning,
      };
    });

    return {
      salesCount: totalOrders,
      sellerEarnings,
      commissionOwed,
      totalProducts,
      lowStockCount,
      dailyOrders: dailyOrders.reverse(),
      monthlySales,
      topStoresByEarnings,
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

  async getVentas(user: User) {
    const myStores = await this.storesService.findStoresByUserId(user.id);
    if (myStores.length === 0) {
      return [];
    }

    const results = await Promise.all(
      myStores.map(async (store) => {
        const commission = Number(store.commission);

        const salesResult = await this.ordersRepository
          .createQueryBuilder('order')
          .select('SUM(order.total_amount)', 'totalRevenue')
          .addSelect('COUNT(*)', 'totalOrders')
          .where('order.store_id = :storeId', { storeId: store.id })
          .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
          .getRawOne<{ totalRevenue: string | null; totalOrders: string }>();

        const totalRevenue = parseFloat(String(salesResult?.totalRevenue ?? '0')) || 0;
        const totalOrders = parseInt(String(salesResult?.totalOrders ?? '0'), 10) || 0;
        const adminEarnings = totalRevenue * (commission / 100);
        const sellerEarnings = totalRevenue - adminEarnings;

        const activeProducts = await this.productsRepository.count({
          where: { storeId: store.id, isActive: true },
        });

        return {
          storeId: store.id,
          storeName: store.name,
          totalRevenue,
          commission,
          sellerEarnings,
          adminEarnings,
          totalOrders,
          activeProducts,
        };
      }),
    );

    return results;
  }
}
