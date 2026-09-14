import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BiometricLoginDto } from './dto/biometric-login.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interfaces';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // REGISTRO
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Registra un nuevo usuario.
   * Verifica que el email no exista, hashea la contraseña con bcrypt
   * y devuelve un JWT junto con los datos públicos del usuario.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        'Error al registrar Usuario, comuníquese con el administrador.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    const accessToken = this.signToken(user);

    return {
      accessToken,
      userId: user.id,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name ?? 'basic',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN CON EMAIL Y CONTRASEÑA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Autentica al usuario con email y contraseña.
   * Usa bcrypt.compare para comparar contra el hash almacenado.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.signToken(user);

    return {
      accessToken,
      userId: user.id,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name ?? 'basic',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN BIOMÉTRICO (Expo / React Native)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Autentica al usuario mediante un token biométrico.
   *
   * Flujo en el cliente (Expo):
   *  1. El usuario abre la app y solicita acceso biométrico.
   *  2. Expo LocalAuthentication.authenticateAsync() verifica Face ID / huella.
   *  3. Si pasa, la app recupera el `biometricToken` almacenado en
   *     expo-secure-store y lo envía junto con el `userId`.
   *  4. Este endpoint valida que el token coincida con el registrado para ese usuario.
   *
   * Para registrar el token biométrico usa el endpoint PATCH /auth/biometric-token.
   */
  async biometricLogin(dto: BiometricLoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('Error con el usuario.');
    }

    if (!user.biometricToken) {
      throw new BadRequestException(
        'La autenticación biométrica no está configurada para este usuario',
      );
    }

    if (user.biometricToken !== dto.biometricToken) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.signToken(user);

    return {
      accessToken,
      userId: user.id,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name ?? 'basic',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REGISTRAR TOKEN BIOMÉTRICO
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Asocia un token biométrico a un usuario autenticado.
   * Llamar desde Expo tras un login exitoso con email/contraseña.
   * El cliente debe almacenar el token en expo-secure-store.
   */
  async registerBiometricToken(
    userId: string,
    biometricToken: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.updateBiometricToken(
      userId,
      biometricToken,
    );
    if (!user) {
      throw new NotFoundException('Error con el usuario.');
    }
    return { message: 'Token biométrico registrado correctamente' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ─────────────────────────────────────────────────────────────────────────────

  private signToken(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: { name: string } | null;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name ?? 'basic',
    };
    return this.jwtService.sign(payload);
  }
}
