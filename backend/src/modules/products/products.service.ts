import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto, FilterProductDto, ProductSortBy, UpdateProductDto } from './dto';
import { User } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';
import { Role } from '../../common/enums';
import { PaginatedResponseDto } from '../../common/dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly storesService: StoresService,
  ) {}

  async create(dto: CreateProductDto, user: User): Promise<Product> {
    const store = await this.storesService.findByUserId(user.id);

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
    }

    const { images, ...updateData } = dto;
    Object.assign(product, updateData);
    await this.productsRepository.save(product);

    return this.findById(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const product = await this.findById(id);
    const store = await this.storesService.findById(product.storeId);

    if (store.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

    product.isActive = false;
    await this.productsRepository.save(product);
  }

  async updateRating(productId: string, averageRating: number, totalReviews: number): Promise<void> {
    await this.productsRepository.update(productId, { averageRating, totalReviews });
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
    if (filters.minRating !== undefined) {
      qb.andWhere('product.averageRating >= :minRating', { minRating: filters.minRating });
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
      case ProductSortBy.RATING:
        qb.orderBy('product.averageRating', 'DESC');
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
