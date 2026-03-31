import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { OrderStatus, PaymentStatus, Role } from '../../common/enums';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalStores,
      approvedStores,
      pendingStores,
      totalProducts,
      activeProducts,
      totalOrders,
      completedOrders,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { role: Role.CUSTOMER } }),
      this.usersRepository.count({ where: { role: Role.SELLER } }),
      this.storesRepository.count(),
      this.storesRepository.count({ where: { isApproved: true } }),
      this.storesRepository.count({ where: { isApproved: false } }),
      this.productsRepository.count(),
      this.productsRepository.count({ where: { isActive: true } }),
      this.ordersRepository.count(),
      this.ordersRepository.count({ where: { status: OrderStatus.DELIVERED } }),
    ]);

    const totalSalesResult = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      users: { total: totalUsers, customers: totalCustomers, sellers: totalSellers },
      stores: { total: totalStores, approved: approvedStores, pending: pendingStores },
      products: { total: totalProducts, active: activeProducts },
      orders: { total: totalOrders, completed: completedOrders },
      revenue: { totalSales: parseFloat(totalSalesResult?.total || '0') },
    };
  }

  async getAllUsers() {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleUserActive(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      user.isActive = !user.isActive;
      return this.usersRepository.save(user);
    }
    return null;
  }

  async getAllStores() {
    return this.storesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllProducts() {
    return this.productsRepository.find({
      relations: ['store', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders() {
    return this.ordersRepository.find({
      relations: ['user', 'store', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStoreCommission(storeId: string, commission: number) {
    await this.storesRepository.update(storeId, { commission });
    return this.storesRepository.findOne({ where: { id: storeId } });
  }

  async getSalesReport() {
    const monthlySales = await this.ordersRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'totalOrders')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy("TO_CHAR(order.created_at, 'YYYY-MM')")
      .orderBy("TO_CHAR(order.created_at, 'YYYY-MM')", 'DESC')
      .limit(12)
      .getRawMany();

    const topStores = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.store', 'store')
      .select('store.id', 'storeId')
      .addSelect('store.name', 'storeName')
      .addSelect('COUNT(*)', 'totalOrders')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .groupBy('store.id')
      .addGroupBy('store.name')
      .orderBy('SUM(order.total_amount)', 'DESC')
      .limit(10)
      .getRawMany();

    return { monthlySales, topStores };
  }
}
