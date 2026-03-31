import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateCommissionDto {
  @ApiProperty({ example: 5.0, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commission: number;
}
