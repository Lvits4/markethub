import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException('Categoría padre no encontrada');
      }
    }

    const category = this.categoriesRepository.create({ ...dto });
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true, parentId: undefined as any },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async findAllFlat(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.name) {
      const existing = await this.categoriesRepository.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    await this.categoriesRepository.update({ parentId: id }, { parentId: null });
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({ categoryId: null })
      .where('category_id = :id', { id })
      .execute();
    await this.categoriesRepository.delete({ id });
  }
}
