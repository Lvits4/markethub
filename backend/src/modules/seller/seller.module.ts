import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order, Payment]),
    StoresModule,
  ],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
