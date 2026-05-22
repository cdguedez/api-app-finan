import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersRepository } from './repositories/users.repository';
import { PrismaModule } from '../prisma/prisma.module';

/** Default token expiry: 7 days in seconds */
const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 7;

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // TODO(security): Use ConfigService + JwtModule.registerAsync() in production
      // to ensure JWT_SECRET is always loaded from environment variables.
      // Never use a fallback literal in production deployments.
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN
          ? Number(process.env.JWT_EXPIRES_IN)
          : DEFAULT_EXPIRES_IN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, UsersRepository],
  exports: [JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
