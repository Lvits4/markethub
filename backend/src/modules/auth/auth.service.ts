import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let role: Role;
    if ((await this.usersService.count()) === 0) {
      role = Role.ADMIN;
    } else {
      role = dto.role;
      if (role !== Role.CUSTOMER && role !== Role.SELLER) {
        throw new BadRequestException(
          'El registro público solo permite CUSTOMER o SELLER',
        );
      }
    }

    const { firstName, lastName } = this.splitDisplayName(dto.name);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken: token,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.usersService.setResetToken(user.id, resetToken, resetExpires);

    // En producción aquí se enviaría un email con el token
    return {
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      resetToken, // Solo en desarrollo
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException(
        'Token de recuperación inválido o ya usado. Debe ser el valor `resetToken` devuelto por POST /auth/forgot-password, no el accessToken JWT de sesión.',
      );
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private generateToken(userId: string, email: string, role: Role): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  /** Guarda nombre completo en first/last para compatibilidad con el modelo existente. */
  private splitDisplayName(name: string): { firstName: string; lastName: string } {
    const trimmed = name.trim();
    const space = trimmed.indexOf(' ');
    if (space === -1) {
      return { firstName: trimmed, lastName: '' };
    }
    return {
      firstName: trimmed.slice(0, space),
      lastName: trimmed.slice(space + 1).trim(),
    };
  }
}
