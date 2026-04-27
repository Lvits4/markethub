import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Calle Principal 123, Ciudad, País' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiPropertyOptional({
    example: 'f1f08a83-ef16-4ac8-8a49-091fb0f1c302',
    description:
      'Si se envía, crea el pedido solo para este item del carrito (compra directa).',
  })
  @IsOptional()
  @IsUUID()
  cartItemId?: string;
}
