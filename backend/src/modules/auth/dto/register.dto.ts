import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'María García López', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: [Role.CUSTOMER, Role.SELLER], example: Role.CUSTOMER })
  @IsIn([Role.CUSTOMER, Role.SELLER], {
    message: 'El rol debe ser CUSTOMER (comprador) o SELLER (vendedor)',
  })
  role: Role.CUSTOMER | Role.SELLER;
}
