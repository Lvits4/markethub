import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Obtener reseñas de un producto' })
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({ summary: 'Crear reseña (Customer)' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(dto, user.id);
  }

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Editar reseña propia' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, dto, user.id);
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reseña propia' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.remove(id, user.id);
  }
}
