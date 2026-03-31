import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Calle Principal 123, Ciudad, País' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
