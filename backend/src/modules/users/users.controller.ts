import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, dto);
  }
}
