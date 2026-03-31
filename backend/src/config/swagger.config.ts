import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('MarketHub API')
  .setDescription('API del Marketplace MarketHub - Backend')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Ingresa tu token JWT',
      in: 'header',
    },
    'access-token',
  )
  .addTag('Auth', 'Autenticación y registro')
  .addTag('Users', 'Gestión de usuarios')
  .addTag('Stores', 'Gestión de tiendas')
  .addTag('Products', 'Gestión de productos')
  .addTag('Categories', 'Categorías de productos')
  .addTag('Cart', 'Carrito de compras')
  .addTag('Orders', 'Pedidos')
  .addTag('Payments', 'Pagos')
  .addTag('Reviews', 'Reseñas y valoraciones')
  .addTag('Favorites', 'Lista de favoritos')
  .addTag('Files', 'Gestión de archivos')
  .addTag('Notifications', 'Notificaciones')
  .addTag('Admin', 'Panel de administración')
  .build();
