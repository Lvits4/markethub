import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async count(): Promise<number> {
    return this.usersRepository.count();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(data.email!);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.usersRepository.update(id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });
  }

  async setResetToken(
    id: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordResetToken: token },
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }
}
