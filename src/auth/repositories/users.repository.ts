import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../interfaces/auth.interfaces';

/**
 * Repositorio de usuarios respaldado por PostgreSQL vía Prisma.
 *
 * Reemplaza la implementación anterior en memoria (Map).
 * Todos los métodos son async para alinearse con las operaciones de BD.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        biometricToken: data.biometricToken ?? null,
      },
    });
    return this.mapToUser(user);
  }

  async updateBiometricToken(
    userId: string,
    biometricToken: string,
  ): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { biometricToken },
      });
      return this.mapToUser(user);
    } catch {
      // Prisma lanza P2025 cuando el registro no existe
      return undefined;
    }
  }

  async findByBiometricToken(token: string): Promise<User | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { biometricToken: token },
    });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  /** Mapea el modelo Prisma al contrato de la interfaz User del módulo auth */
  private mapToUser(p: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    biometricToken: string | null;
    createdAt: Date;
  }): User {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      passwordHash: p.passwordHash,
      biometricToken: p.biometricToken ?? undefined,
      createdAt: p.createdAt,
    };
  }
}
