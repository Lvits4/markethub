import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { DataSource, EntityManager, In, Like, Repository } from 'typeorm';
import { Role, OrderStatus, PaymentStatus } from '../common/enums';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Store } from '../modules/stores/entities/store.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { Cart } from '../modules/cart/entities/cart.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { Favorite } from '../modules/favorites/entities/favorite.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { StoresService } from '../modules/stores/stores.service';
import {
  SEED_EMAIL_DOMAIN,
  SEED_PASSWORD,
  SEED_CATEGORIES,
  SEED_STORES,
  SEED_PRODUCTS_BY_STORE,
  CUSTOMER_FIRST_NAMES,
  CUSTOMER_LAST_NAMES,
  SELLER_FIRST_NAMES,
  SELLER_LAST_NAMES,
} from './seed.data';

export interface SeedResult {
  message: string;
  password: string;
  counts: {
    users: number;
    categories: number;
    stores: number;
    approvedStores: number;
    pendingStores: number;
    products: number;
    prunedProducts?: number;
    favorites: number;
    carts: number;
    orders: number;
  };
  credentials: {
    customers: string[];
    sellers: string[];
  };
}

@Injectable()
export class SeedService {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly storesService: StoresService,
  ) {}

  async run(force = false): Promise<SeedResult> {
    if (this.configService.get<string>('NODE_ENV') !== 'development') {
      throw new ForbiddenException('El seed solo está disponible en desarrollo');
    }

    const existing = await this.usersRepository.findOne({
      where: { email: `customer1@${SEED_EMAIL_DOMAIN}` },
    });

    if (existing && !force) {
      throw new ConflictException(
        'Los datos seed ya existen. Usa ?force=true para eliminarlos y volver a crear.',
      );
    }

    if (force) {
      await this.cleanupSeedData();
    }

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
    const categoryMap = new Map<string, Category>();
    const customers: User[] = [];
    const sellers: User[] = [];
    const stores: Store[] = [];
    const approvedStores: Store[] = [];
    const pendingStores: Store[] = [];
    const products: Product[] = [];
    let favoritesCount = 0;
    let cartsCount = 0;
    let ordersCount = 0;
    let finalProductCount = 0;
    let prunedProducts = 0;

    await this.dataSource.transaction(async (em) => {
      for (const cat of SEED_CATEGORIES) {
        const category = em.create(Category, { ...cat, isActive: true });
        const saved = await em.save(category);
        categoryMap.set(cat.name, saved);
      }

      for (let i = 0; i < 10; i++) {
        const user = em.create(User, {
          email: `customer${i + 1}@${SEED_EMAIL_DOMAIN}`,
          password: hashedPassword,
          firstName: CUSTOMER_FIRST_NAMES[i],
          lastName: CUSTOMER_LAST_NAMES[i],
          role: Role.CUSTOMER,
          isActive: true,
        });
        customers.push(await em.save(user));
      }

      for (let i = 0; i < 10; i++) {
        const user = em.create(User, {
          email: `seller${i + 1}@${SEED_EMAIL_DOMAIN}`,
          password: hashedPassword,
          firstName: SELLER_FIRST_NAMES[i],
          lastName: SELLER_LAST_NAMES[i],
          role: Role.SELLER,
          isActive: true,
        });
        sellers.push(await em.save(user));
      }

      for (let i = 0; i < SEED_STORES.length; i++) {
        const storeData = SEED_STORES[i];
        const seller = sellers[i];
        const slug = this.slugify(storeData.name);

        const store = em.create(Store, {
          name: storeData.name,
          description: storeData.description,
          shippingPolicy: storeData.shippingPolicy,
          returnPolicy: storeData.returnPolicy,
          logo: storeData.logo,
          slug,
          userId: seller.id,
          contactEmail: seller.email,
          contactPhone: `+34 600 ${String(100000 + i).slice(-6)}`,
          isApproved: storeData.approved,
          isRejected: false,
          isActive: true,
          commission: 5.0,
        });
        const savedStore = await em.save(store);
        stores.push(savedStore);
        if (storeData.approved) {
          approvedStores.push(savedStore);
        } else {
          pendingStores.push(savedStore);
        }
      }

      for (const store of approvedStores) {
        const productDefs = SEED_PRODUCTS_BY_STORE[store.name] ?? [];
        for (const def of productDefs) {
          const slug = this.slugify(`${store.name}-${def.name}`);
          const category = categoryMap.get(def.category);

          const product = em.create(Product, {
            name: def.name,
            slug,
            description: def.description,
            price: def.price,
            stock: def.stock,
            storeId: store.id,
            categoryId: category?.id,
            isActive: true,
          });
          const savedProduct = await em.save(product);

          const image = em.create(ProductImage, {
            productId: savedProduct.id,
            url: def.imageUrl,
            altText: def.name,
            sortOrder: 0,
          });
          await em.save(image);
          products.push(savedProduct);
        }
      }

      for (let i = 0; i < 5; i++) {
        const customer = customers[i];
        const favProducts = products.slice(i * 2, i * 2 + 3);
        for (const product of favProducts) {
          const favorite = em.create(Favorite, {
            userId: customer.id,
            productId: product.id,
          });
          await em.save(favorite);
          favoritesCount += 1;
        }
      }

      for (let i = 5; i < 8; i++) {
        const customer = customers[i];
        const cart = em.create(Cart, { userId: customer.id });
        const savedCart = await em.save(cart);
        cartsCount += 1;

        const cartProducts = products.slice(i * 2, i * 2 + 2);
        for (const product of cartProducts) {
          const item = em.create(CartItem, {
            cartId: savedCart.id,
            productId: product.id,
            quantity: 1,
          });
          await em.save(item);
        }
      }

      const orderStatuses = [
        OrderStatus.CONFIRMED,
        OrderStatus.DELIVERED,
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ];

      for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        const ordersThisDay = 1 + (daysAgo % 3);
        for (let j = 0; j < ordersThisDay; j++) {
          const orderIndex = ordersCount;
          const customer = customers[orderIndex % customers.length];
          const store = approvedStores[orderIndex % approvedStores.length];
          const storeProducts = products.filter((p) => p.storeId === store.id);
          if (storeProducts.length === 0) continue;

          const itemCount = 1 + (orderIndex % 2);
          const orderProducts = storeProducts.slice(0, itemCount);
          let total = 0;
          for (const p of orderProducts) {
            total += Number(p.price) * (1 + (orderIndex % 2));
          }

          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);
          createdAt.setHours(9 + j * 4, (orderIndex * 11) % 60, 0, 0);

          const status = orderStatuses[orderIndex % orderStatuses.length];

          const order = em.create(Order, {
            userId: customer.id,
            storeId: store.id,
            totalAmount: total,
            shippingAddress: `Calle Ejemplo ${(orderIndex % 20) + 1}, Madrid, 2800${orderIndex % 10}`,
            status,
            createdAt,
            updatedAt: createdAt,
          });
          const savedOrder = await em.save(order);
          ordersCount += 1;

          for (const p of orderProducts) {
            const qty = 1 + (orderIndex % 2);
            const item = em.create(OrderItem, {
              orderId: savedOrder.id,
              productId: p.id,
              quantity: qty,
              unitPrice: p.price,
            });
            await em.save(item);
          }

          const payment = em.create(Payment, {
            orderId: savedOrder.id,
            amount: total,
            method: 'mock',
            status: PaymentStatus.COMPLETED,
            transactionId: `SEED-TXN-${orderIndex + 1}`,
          });
          await em.save(payment);
        }
      }

      prunedProducts = await this.pruneProductsWithoutValidImages(em);
      finalProductCount = await em.count(Product);
    });

    return {
      message:
        prunedProducts > 0
          ? `Base de datos poblada correctamente (${prunedProducts} producto(s) sin imagen válida eliminados)`
          : 'Base de datos poblada correctamente',
      password: SEED_PASSWORD,
      counts: {
        users: 20,
        categories: SEED_CATEGORIES.length,
        stores: stores.length,
        approvedStores: approvedStores.length,
        pendingStores: pendingStores.length,
        products: finalProductCount,
        prunedProducts,
        favorites: favoritesCount,
        carts: cartsCount,
        orders: ordersCount,
      },
      credentials: {
        customers: customers.map((u) => u.email),
        sellers: sellers.map((u) => u.email),
      },
    };
  }

  async pruneProductsWithoutValidImagesPublic(): Promise<{ removed: number; remaining: number }> {
    if (this.configService.get<string>('NODE_ENV') !== 'development') {
      throw new ForbiddenException('Solo disponible en desarrollo');
    }
    let removed = 0;
    let remaining = 0;
    await this.dataSource.transaction(async (em) => {
      removed = await this.pruneProductsWithoutValidImages(em);
      remaining = await em.count(Product);
    });
    return { removed, remaining };
  }

  private storageRoot(): string {
    return path.resolve(
      this.configService.get<string>('STORAGE_ROOT_PATH') ||
        process.env.STORAGE_ROOT_PATH ||
        './uploads',
    );
  }

  private checkRemoteImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, { method: 'HEAD' }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(8000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  private async isProductImageValid(url: string | undefined | null): Promise<boolean> {
    const trimmed = (url ?? '').trim();
    if (!trimmed) return false;
    if (/^https?:\/\//i.test(trimmed)) {
      return this.checkRemoteImageUrl(trimmed);
    }
    const filePath = path.join(this.storageRoot(), trimmed.replace(/^\/+/, ''));
    return fs.existsSync(filePath);
  }

  /** Elimina productos sin imagen o con URL/archivo de imagen inválido. */
  private async pruneProductsWithoutValidImages(em: EntityManager): Promise<number> {
    const products = await em.find(Product, { relations: ['images'] });
    let removed = 0;

    for (const product of products) {
      const primary = [...(product.images ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      )[0];
      const valid = await this.isProductImageValid(primary?.url);
      if (!valid) {
        await this.removeProductAndReferences(em, product.id);
        removed += 1;
      }
    }

    return removed;
  }

  private async removeProductAndReferences(
    em: EntityManager,
    productId: string,
  ): Promise<void> {
    await em.delete(CartItem, { productId });
    await em.delete(Favorite, { productId });

    const orderItems = await em.find(OrderItem, { where: { productId } });
    const orderIds = [...new Set(orderItems.map((item) => item.orderId))];
    await em.delete(OrderItem, { productId });

    for (const orderId of orderIds) {
      const remaining = await em.find(OrderItem, { where: { orderId } });
      if (remaining.length === 0) {
        await em.delete(Payment, { orderId });
        await em.delete(Order, { id: orderId });
      } else {
        const total = remaining.reduce(
          (sum, item) => sum + Number(item.unitPrice) * item.quantity,
          0,
        );
        await em.update(Order, { id: orderId }, { totalAmount: total });
        const payment = await em.findOne(Payment, { where: { orderId } });
        if (payment) {
          await em.update(Payment, { id: payment.id }, { amount: total });
        }
      }
    }

    await em.delete(ProductImage, { productId });
    await em.delete(Product, { id: productId });
  }

  private async cleanupSeedData(): Promise<void> {
    const seedUsers = await this.usersRepository.find({
      where: { email: Like(`%@${SEED_EMAIL_DOMAIN}`) },
      select: ['id'],
    });

    if (seedUsers.length === 0) {
      const categoryNames = SEED_CATEGORIES.map((c) => c.name);
      await this.categoriesRepository.delete({ name: In(categoryNames) });
      return;
    }

    await this.dataSource.transaction(async (em) => {
      for (const { id: userId } of seedUsers) {
        await this.cleanupUser(em, userId);
      }

      const categoryNames = SEED_CATEGORIES.map((c) => c.name);
      await em.delete(Category, { name: In(categoryNames) });
    });
  }

  private async cleanupUser(em: EntityManager, userId: string): Promise<void> {
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
    for (const store of stores) {
      await this.storesService.removeStoreInTransaction(em, store.id);
    }

    await em.delete(User, { id: userId });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
