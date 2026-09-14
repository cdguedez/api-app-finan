import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Role } from '../interfaces/auth.interfaces';

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
      include: { role: true },
    });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    let roleId = data.roleId;

    // Si no se especifica roleId, buscar el rol 'basic' por defecto
    if (!roleId) {
      const basicRole = await this.prisma.role.findUnique({
        where: { name: 'basic' },
      });
      if (basicRole) {
        roleId = basicRole.id;
      }
    }

    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        biometricToken: data.biometricToken ?? null,
        roleId: roleId ?? null,
      },
      include: { role: true },
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
        include: { role: true },
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
      include: { role: true },
    });
    if (!user) return undefined;
    return this.mapToUser(user);
  }

  /** Mapea el modelo Prisma al contrato de la interfaz User del módulo auth */
  private mapToUser(p: {
    id: string;
    roleId?: string | null;
    role?: Role | null;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    biometricToken: string | null;
    createdAt: Date;
  }): User {
    return {
      id: p.id,
      roleId: p.roleId,
      role: p.role
        ? {
            id: p.role.id,
            name: p.role.name,
            description: p.role.description,
            createdAt: p.role.createdAt,
            updatedAt: p.role.updatedAt,
          }
        : null,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      passwordHash: p.passwordHash,
      biometricToken: p.biometricToken ?? undefined,
      createdAt: p.createdAt,
    };
  }
}
