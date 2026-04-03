import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoritesRepository: Repository<Favorite>,
    private readonly productsService: ProductsService,
  ) {}

  async add(userId: string, productId: string): Promise<Favorite> {
    await this.productsService.findById(productId);

    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('El producto ya está en favoritos');
    }

    const favorite = this.favoritesRepository.create({ userId, productId });
    return this.favoritesRepository.save(favorite);
  }

  async remove(userId: string, productId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    if (!favorite) {
      throw new NotFoundException('El producto no está en favoritos');
    }
    await this.favoritesRepository.delete({ id: favorite.id });
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { userId },
      relations: ['product', 'product.images', 'product.store'],
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const count = await this.favoritesRepository.count({
      where: { userId, productId },
    });
    return count > 0;
  }
}
