import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
  expiration: process.env.JWT_EXPIRATION || '1d',
}));
