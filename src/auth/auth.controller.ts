import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BiometricLoginDto } from './dto/biometric-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Crea una nueva cuenta de usuario.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Autentica con email y contraseña. Devuelve JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/biometric-login
   * Autentica mediante token biométrico generado por Expo LocalAuthentication.
   * El cliente debe enviar el userId (almacenado en SecureStore) y el token
   * biométrico previamente registrado.
   */
  @Post('biometric-login')
  @HttpCode(HttpStatus.OK)
  biometricLogin(@Body() dto: BiometricLoginDto) {
    return this.authService.biometricLogin(dto);
  }

  /**
   * PATCH /auth/biometric-token
   * Registra o actualiza el token biométrico del usuario autenticado.
   * Requiere JWT válido (llamar después de un login con email/contraseña).
   *
   * Body: { biometricToken: string }
   *
   * Flujo Expo:
   *  1. Login exitoso con email/contraseña → recibe JWT.
   *  2. Llamar a este endpoint con el token biométrico (UUID generado en cliente).
   *  3. Guardar ese token en expo-secure-store.
   *  4. Futuros accesos usan POST /auth/biometric-login.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('biometric-token')
  @HttpCode(HttpStatus.OK)
  registerBiometricToken(
    @Request() req: { user: { id: string } },
    @Body('biometricToken') biometricToken: string,
  ) {
    return this.authService.registerBiometricToken(req.user.id, biometricToken);
  }
}
