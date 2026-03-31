import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    await this.productsService.findById(dto.productId);

    const existing = await this.reviewsRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new ConflictException('Ya has dejado una reseña para este producto');
    }

    const review = this.reviewsRepository.create({ ...dto, userId });
    const saved = await this.reviewsRepository.save(review);

    await this.updateProductRating(dto.productId);

    return saved;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateReviewDto, user: User): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }
    if (review.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No puedes editar esta reseña');
    }

    Object.assign(review, dto);
    const updated = await this.reviewsRepository.save(review);

    await this.updateProductRating(review.productId);

    return updated;
  }

  async remove(id: string, user: User): Promise<void> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }
    if (review.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('No puedes eliminar esta reseña');
    }

    const productId = review.productId;
    await this.reviewsRepository.remove(review);
    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.product_id = :productId', { productId })
      .getRawOne();

    const avg = parseFloat(result.avg) || 0;
    const count = parseInt(result.count, 10) || 0;

    await this.productsService.updateRating(productId, avg, count);
  }
}
