import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto, user: User): Promise<Store> {
    if (user.role !== Role.SELLER) {
      throw new ForbiddenException('Solo los vendedores pueden crear tiendas');
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
