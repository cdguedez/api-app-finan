import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, User } from '../interfaces/auth.interfaces';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Estrategia JWT de Passport.
 * Extrae el Bearer token del header Authorization y valida la firma.
 * Se usa en el guard `JwtAuthGuard` para proteger rutas privadas.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersRepository: UsersRepository) {
    const secret = process.env.JWT_SECRET;
    // TODO(security): Use JwtModule.registerAsync + ConfigService to guarantee
    // JWT_SECRET is resolved before app bootstrap.
    if (!secret) {
      throw new Error(
        'JWT_SECRET environment variable is not set. Set it in your .env file.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<Omit<User, 'passwordHash' | 'biometricToken'>> {
    const user = await this.usersRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no encontrado');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, biometricToken: _bt, ...safeUser } = user;
    return safeUser;
  }
}
