import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Iniciando la siembra de base de datos (Seeding)...');

  // 1. Crear o actualizar Roles
  const basicRole = await prisma.role.upsert({
    where: { name: 'basic' },
    update: {
      description: 'Usuario estándar con acceso a gestión personal de finanzas',
    },
    create: {
      name: 'basic',
      description: 'Usuario estándar con acceso a gestión personal de finanzas',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      description: 'Administrador del sistema con privilegios completos',
    },
    create: {
      name: 'admin',
      description: 'Administrador del sistema con privilegios completos',
    },
  });

  console.log('✅ Roles creados/verificados: basic, admin');

  // 2. Hashear contraseña por defecto para los usuarios semilla
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // 3. Crear o actualizar Usuario Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      roleId: adminRole.id,
      firstName: 'Admin',
      lastName: 'Sistema',
      passwordHash,
    },
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'Sistema',
      passwordHash,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Usuario Admin creado/actualizado: ${adminUser.email} (Rol: admin)`);

  // 4. Crear o actualizar Usuario Basic
  const basicUser = await prisma.user.upsert({
    where: { email: 'basic@example.com' },
    update: {
      roleId: basicRole.id,
      firstName: 'Usuario',
      lastName: 'Básico',
      passwordHash,
    },
    create: {
      email: 'basic@example.com',
      firstName: 'Usuario',
      lastName: 'Básico',
      passwordHash,
      roleId: basicRole.id,
    },
  });

  console.log(`✅ Usuario Básico creado/actualizado: ${basicUser.email} (Rol: basic)`);
  console.log('🌱 Proceso de seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
