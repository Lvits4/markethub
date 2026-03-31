import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.store'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user: { id: userId } as any });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const product = await this.productsService.findById(dto.productId);

    if (product.stock < dto.quantity) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find((item) => item.productId === dto.productId);

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      if (existingItem.quantity > product.stock) {
        throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
      }
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    const product = await this.productsService.findById(item.productId);
    if (dto.quantity > product.stock) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }

  async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const storeGroups: Record<string, { storeName: string; items: any[]; subtotal: number }> = {};

    for (const item of cart.items) {
      const storeId = item.product.storeId;
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          storeName: item.product.store?.name || 'Tienda',
          items: [],
          subtotal: 0,
        };
      }
      const itemTotal = Number(item.product.price) * item.quantity;
      storeGroups[storeId].items.push({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        total: itemTotal,
      });
      storeGroups[storeId].subtotal += itemTotal;
    }

    const globalTotal = Object.values(storeGroups).reduce((sum, g) => sum + g.subtotal, 0);

    return {
      stores: Object.entries(storeGroups).map(([storeId, group]) => ({
        storeId,
        ...group,
      })),
      totalItems: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      globalTotal,
    };
  }
}
