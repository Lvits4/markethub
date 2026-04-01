import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { User } from '../users/entities/user.entity';
import { OrderStatus, Role } from '../../common/enums';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Payment } from '../payments/entities/payment.entity';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateStoreDto, user: User): Promise<Store> {
    if (user.role !== Role.SELLER && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo vendedores o administradores pueden crear tiendas',
      );
    }

    const slug = this.generateSlug(dto.name);
    const existingSlug = await this.storesRepository.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Ya existe una tienda con ese nombre');
    }

    const store = this.storesRepository.create({
      ...dto,
      slug,
      userId: user.id,
      isApproved: user.role === Role.ADMIN,
    });
    return this.storesRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storesRepository.find({
      where: { isActive: true, isApproved: true },
      order: { name: 'ASC' },
    });
  }

  /** Cola de moderación: pendientes de decisión (`isApproved: false` y sin rechazo explícito). */
  async findAllRejected(): Promise<Store[]> {
    return this.storesRepository.find({
      where: { isApproved: false, isRejected: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }
    return store;
  }

  /**
   * Busca por id (UUID), slug o nombre (coincidencia exacta sin distinguir mayúsculas).
   */
  async findByTerm(term: string): Promise<Store> {
    const t = term.trim();
    if (!t) {
      throw new BadRequestException('El término de búsqueda no puede estar vacío');
    }

    if (UUID_PATTERN.test(t)) {
      const byId = await this.storesRepository.findOne({
        where: { id: t },
        relations: ['user'],
      });
      if (byId) {
        return byId;
      }
      throw new NotFoundException('Tienda no encontrada');
    }

    let store = await this.storesRepository.findOne({
      where: { slug: t },
      relations: ['user'],
    });
    if (store) {
      return store;
    }

    const normalizedSlug = this.generateSlug(t);
    if (normalizedSlug && normalizedSlug !== t) {
      store = await this.storesRepository.findOne({
        where: { slug: normalizedSlug },
        relations: ['user'],
      });
      if (store) {
        return store;
      }
    }

    store = await this.storesRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.user', 'user')
      .where('LOWER(store.name) = LOWER(:name)', { name: t })
      .getOne();
    if (store) {
      return store;
    }

    throw new NotFoundException('Tienda no encontrada');
  }

  async findStoresByUserId(userId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Resuelve en qué tienda crear un producto: una sola tienda del usuario si no envían storeId;
   * con varias tiendas, storeId es obligatorio. Un admin puede indicar cualquier tienda con storeId.
   */
  async resolveStoreForCreate(user: User, storeId?: string): Promise<Store> {
    const myStores = await this.findStoresByUserId(user.id);

    if (user.role === Role.ADMIN) {
      if (storeId) {
        return this.findById(storeId);
      }
      if (myStores.length === 1) {
        return myStores[0];
      }
      if (myStores.length === 0) {
        throw new BadRequestException(
          'Indica storeId de la tienda o crea una tienda asociada a tu cuenta',
        );
      }
      throw new BadRequestException(
        'Tienes varias tiendas; indica storeId en el body para crear el producto',
      );
    }

    if (myStores.length === 0) {
      throw new NotFoundException('No tienes una tienda registrada');
    }
    if (storeId) {
      const store = myStores.find((s) => s.id === storeId);
      if (!store) {
        throw new ForbiddenException('La tienda no existe o no te pertenece');
      }
      return store;
    }
    if (myStores.length > 1) {
      throw new BadRequestException(
        'Tienes varias tiendas; indica storeId en el body',
      );
    }
    return myStores[0];
  }

  async update(id: string, dto: UpdateStoreDto, user: User): Promise<Store> {
    const store = await this.findById(id);

    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar esta tienda');
    }

    if (dto.name) {
      const slug = this.generateSlug(dto.name);
      const existing = await this.storesRepository.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe una tienda con ese nombre');
      }
      (store as any).slug = slug;
    }

    Object.assign(store, dto);
    return this.storesRepository.save(store);
  }

  /**
   * Elimina una tienda y datos ligados (productos, pedidos de esa tienda, etc.)
   * dentro de un EntityManager existente (p. ej. transacción de borrado de usuario).
   */
  async removeStoreInTransaction(em: EntityManager, storeId: string): Promise<void> {
    const products = await em.find(Product, {
      where: { storeId },
      select: ['id'],
    });
    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      await em.delete(CartItem, { productId: In(productIds) });
      await em.delete(Favorite, { productId: In(productIds) });
      await em.delete(ProductImage, { productId: In(productIds) });
      await em.delete(Product, { storeId });
    }

    const orders = await em.find(Order, {
      where: { storeId },
      select: ['id'],
    });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      await em.delete(Payment, { orderId: In(orderIds) });
      await em.delete(OrderItem, { orderId: In(orderIds) });
    }
    await em.delete(Order, { storeId });

    await em.delete(Store, { id: storeId });
  }

  async remove(id: string, user: User): Promise<void> {
    const store = await this.findById(id);
    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar esta tienda');
    }

    await this.dataSource.transaction(async (em) => {
      await this.removeStoreInTransaction(em, id);
    });
  }

  async approve(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isApproved = true;
    store.isRejected = false;
    return this.storesRepository.save(store);
  }

  async reject(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isApproved = false;
    store.isRejected = true;
    return this.storesRepository.save(store);
  }

  async findAllForAdmin(): Promise<Store[]> {
    return this.storesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Detalle de tienda con agregados de productos y pedidos (panel admin / vendedor). */
  async getStoreWithStats(storeId: string) {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
      relations: ['user'],
    });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const [productsTotal, productsActive, rawStats] = await Promise.all([
      this.productsRepository.count({ where: { storeId } }),
      this.productsRepository.count({ where: { storeId, isActive: true } }),
      this.ordersRepository
        .createQueryBuilder('o')
        .select('COUNT(o.id)', 'ordersTotal')
        .addSelect(
          'COALESCE(SUM(CASE WHEN o.status != :cancelled THEN o.total_amount ELSE 0 END), 0)',
          'revenue',
        )
        .addSelect(
          'COALESCE(SUM(CASE WHEN o.status = :delivered THEN 1 ELSE 0 END), 0)',
          'ordersDelivered',
        )
        .where('o.store_id = :storeId', { storeId })
        .setParameters({
          cancelled: OrderStatus.CANCELLED,
          delivered: OrderStatus.DELIVERED,
        })
        .getRawOne<{
          ordersTotal: string;
          revenue: string | null;
          ordersDelivered: string | null;
        }>(),
    ]);

    const ordersTotal =
      Number.parseInt(String(rawStats?.ordersTotal ?? '0'), 10) || 0;
    const ordersDelivered =
      Number.parseInt(String(rawStats?.ordersDelivered ?? '0'), 10) || 0;
    const revenue = parseFloat(String(rawStats?.revenue ?? '0')) || 0;

    const stats = {
      productsTotal,
      productsActive,
      ordersTotal,
      ordersDelivered,
      revenue,
    };

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
      return { ...store, user: safeUser, stats };
    }
    return { ...store, stats };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
