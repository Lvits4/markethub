import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Review } from '../reviews/entities/review.entity';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateStoreDto, user: User): Promise<Store> {
    if (user.role !== Role.SELLER && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo vendedores o administradores pueden crear tiendas',
      );
    }

    const existingStore = await this.storesRepository.findOne({
      where: { userId: user.id },
    });
    if (existingStore) {
      throw new ConflictException('Ya tienes una tienda registrada');
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

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { slug, isActive: true },
    });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }
    return store;
  }

  async findByUserId(userId: string): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { userId },
    });
    if (!store) {
      throw new NotFoundException('No tienes una tienda registrada');
    }
    return store;
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

  async remove(id: string, user: User): Promise<void> {
    const store = await this.findById(id);
    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar esta tienda');
    }

    await this.dataSource.transaction(async (em) => {
      const products = await em.find(Product, {
        where: { storeId: id },
        select: ['id'],
      });
      const productIds = products.map((p) => p.id);

      if (productIds.length > 0) {
        await em.delete(CartItem, { productId: In(productIds) });
        await em.delete(Favorite, { productId: In(productIds) });
        await em.delete(Review, { productId: In(productIds) });
        await em.delete(ProductImage, { productId: In(productIds) });
        await em.delete(Product, { storeId: id });
      }

      const orders = await em.find(Order, {
        where: { storeId: id },
        select: ['id'],
      });
      const orderIds = orders.map((o) => o.id);

      if (orderIds.length > 0) {
        await em.delete(Payment, { orderId: In(orderIds) });
        await em.delete(OrderItem, { orderId: In(orderIds) });
      }
      await em.delete(Order, { storeId: id });

      await em.delete(Store, { id });
    });
  }

  async approve(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isApproved = true;
    return this.storesRepository.save(store);
  }

  async reject(id: string): Promise<Store> {
    const store = await this.findById(id);
    store.isApproved = false;
    return this.storesRepository.save(store);
  }

  async findAllForAdmin(): Promise<Store[]> {
    return this.storesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
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
