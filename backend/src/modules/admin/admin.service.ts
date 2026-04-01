import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { StoresService } from '../stores/stores.service';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto';
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
    private readonly dataSource: DataSource,
    private readonly storesService: StoresService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalStores,
      approvedStores,
      rejectedStores,
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
      this.storesRepository.count({
        where: { isApproved: false, isRejected: true },
      }),
      this.storesRepository.count({
        where: { isApproved: false, isRejected: false },
      }),
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
      stores: {
        total: totalStores,
        approved: approvedStores,
        rejected: rejectedStores,
        pending: pendingStores,
      },
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

  private sanitizeUserForAdminList(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async createUser(dto: AdminCreateUserDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.usersRepository.save(user);
    return this.sanitizeUserForAdminList(saved);
  }

  async updateUser(userId: string, dto: AdminUpdateUserDto, actor: User) {
    const fields: (keyof AdminUpdateUserDto)[] = [
      'email',
      'password',
      'firstName',
      'lastName',
      'role',
      'isActive',
    ];
    const anySet = fields.some((k) => dto[k] !== undefined);
    if (!anySet) {
      throw new BadRequestException('Envía al menos un campo para actualizar');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const taken = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException('El email ya está registrado');
      }
      user.email = dto.email;
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    if (dto.role !== undefined && dto.role !== user.role) {
      if (actor.id === userId && dto.role !== Role.ADMIN) {
        throw new BadRequestException(
          'No puedes cambiar tu propio rol de administrador',
        );
      }
      if (user.role === Role.ADMIN && dto.role !== Role.ADMIN) {
        const adminCount = await this.usersRepository.count({
          where: { role: Role.ADMIN },
        });
        if (adminCount <= 1) {
          throw new BadRequestException('Debe existir al menos un administrador');
        }
      }
      user.role = dto.role;
    }

    if (dto.isActive !== undefined && dto.isActive !== user.isActive) {
      if (actor.id === userId && dto.isActive === false) {
        throw new BadRequestException(
          'No puedes desactivar tu propia cuenta desde aquí',
        );
      }
      if (!dto.isActive && user.role === Role.ADMIN && user.isActive) {
        const activeAdmins = await this.usersRepository.count({
          where: { role: Role.ADMIN, isActive: true },
        });
        if (activeAdmins <= 1) {
          throw new BadRequestException(
            'No se puede desactivar el único administrador activo',
          );
        }
      }
      user.isActive = dto.isActive;
    }

    if (dto.password != null && dto.password.length > 0) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.usersRepository.save(user);
    return this.sanitizeUserForAdminList(saved);
  }

  async toggleUserActive(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    if (user.isActive && user.role === Role.ADMIN) {
      const activeAdmins = await this.usersRepository.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException(
          'No se puede desactivar el único administrador activo',
        );
      }
    }
    user.isActive = !user.isActive;
    const saved = await this.usersRepository.save(user);
    return this.sanitizeUserForAdminList(saved);
  }

  /**
   * Borrado definitivo: pedidos del usuario como cliente, favoritos, carrito,
   * cada tienda del usuario (con productos y pedidos de tienda) y el registro User.
   */
  async deleteUser(userId: string, actor: User): Promise<void> {
    if (actor.id === userId) {
      throw new BadRequestException('No puedes eliminar tu propio usuario');
    }
    const target = await this.usersRepository.findOne({ where: { id: userId } });
    if (!target) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (target.role === Role.ADMIN) {
      const adminCount = await this.usersRepository.count({
        where: { role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('No se puede eliminar el único administrador');
      }
    }

    await this.dataSource.transaction(async (em) => {
      const ordersAsCustomer = await em.find(Order, {
        where: { userId },
        select: ['id'],
      });
      const customerOrderIds = ordersAsCustomer.map((o) => o.id);
      if (customerOrderIds.length > 0) {
        await em.delete(Payment, { orderId: In(customerOrderIds) });
        await em.delete(OrderItem, { orderId: In(customerOrderIds) });
      }
      await em.delete(Order, { userId });

      await em.delete(Favorite, { userId });

      const cart = await em.findOne(Cart, { where: { userId } });
      if (cart) {
        await em.delete(CartItem, { cartId: cart.id });
        await em.delete(Cart, { id: cart.id });
      }

      const stores = await em.find(Store, {
        where: { userId },
        select: ['id'],
      });
      for (const s of stores) {
        await this.storesService.removeStoreInTransaction(em, s.id);
      }

      await em.delete(User, { id: userId });
    });
  }

  async getAllStores() {
    return this.storesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStoreById(storeId: string) {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
      relations: ['user'],
    });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }
    const u = store.user;
    if (u) {
      const {
        password: _p,
        passwordResetToken: _t,
        passwordResetExpires: _e,
        ...safeUser
      } = u as User & {
        password?: string;
        passwordResetToken?: string | null;
        passwordResetExpires?: Date | null;
      };
      return { ...store, user: safeUser };
    }
    return store;
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

  async deleteStore(storeId: string, actor: User) {
    await this.storesService.remove(storeId, actor);
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
