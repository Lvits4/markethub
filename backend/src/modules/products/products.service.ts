import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateProductDto, FilterProductDto, ProductSortBy, UpdateProductDto } from './dto';
import { User } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';
import { Role } from '../../common/enums';
import { PaginatedResponseDto } from '../../common/dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly storesService: StoresService,
  ) {}

  async create(dto: CreateProductDto, user: User): Promise<Product> {
    const store = await this.storesService.resolveStoreForCreate(user, dto.storeId);

    const slug = this.generateSlug(dto.name);

    const product = this.productsRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      categoryId: dto.categoryId,
      storeId: store.id,
    });

    const savedProduct = await this.productsRepository.save(product);

    if (dto.images?.length) {
      const images = dto.images.map((img) =>
        this.productImagesRepository.create({
          ...img,
          productId: savedProduct.id,
        }),
      );
      await this.productImagesRepository.save(images);
    }

    return this.findById(savedProduct.id);
  }

  async findAll(filters: FilterProductDto): Promise<PaginatedResponseDto<Product>> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    this.applyFilters(qb, filters);
    this.applySorting(qb, filters.sortBy);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['images', 'store', 'category'],
      order: {
        images: { sortOrder: 'ASC' },
      },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async findByStore(storeId: string, filters: FilterProductDto): Promise<PaginatedResponseDto<Product>> {
    const modifiedFilters = { ...filters, storeId };
    return this.findAll(modifiedFilters);
  }

  async update(id: string, dto: UpdateProductDto, user: User): Promise<Product> {
    const product = await this.findById(id);
    const store = await this.storesService.findById(product.storeId);

    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    if (dto.name) {
      product.slug = this.generateSlug(dto.name);
    }

    if (dto.images) {
      await this.productImagesRepository.delete({ productId: id });
      const images = dto.images.map((img) =>
        this.productImagesRepository.create({ ...img, productId: id }),
      );
      await this.productImagesRepository.save(images);
      // findById cargó `images` en memoria; ya se borraron/recrearon en BD. Si
      // guardamos el product con cascade, TypeORM intenta sincronizar filas
      // huérfanas y puede fallar con 500.
      delete (product as { images?: ProductImage[] }).images;
    }

    const { images, ...updateData } = dto;
    Object.assign(product, updateData);
    if (Object.prototype.hasOwnProperty.call(updateData, 'categoryId')) {
      delete (product as { category?: unknown }).category;
    }
    await this.productsRepository.save(product);

    return this.findById(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const product = await this.findById(id);
    const store = await this.storesService.findById(product.storeId);

    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

    await this.dataSource.transaction(async (manager) => {
      const inOrders = await manager.count(OrderItem, { where: { productId: id } });
      if (inOrders > 0) {
        throw new ConflictException(
          'No se puede eliminar el producto porque consta en uno o más pedidos.',
        );
      }

      await manager.delete(CartItem, { productId: id });
      await manager.delete(Favorite, { productId: id });
      await manager.delete(ProductImage, { productId: id });
      await manager.delete(Product, { id });
    });
  }

  private applyFilters(qb: SelectQueryBuilder<Product>, filters: FilterProductDto): void {
    if (filters.search) {
      qb.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }
    if (filters.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters.storeId) {
      qb.andWhere('product.storeId = :storeId', { storeId: filters.storeId });
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
  }

  private applySorting(qb: SelectQueryBuilder<Product>, sortBy?: ProductSortBy): void {
    switch (sortBy) {
      case ProductSortBy.PRICE_ASC:
        qb.orderBy('product.price', 'ASC');
        break;
      case ProductSortBy.PRICE_DESC:
        qb.orderBy('product.price', 'DESC');
        break;
      case ProductSortBy.NEWEST:
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
}
