import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { StoresModule } from '../modules/stores/stores.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category]),
    StoresModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
