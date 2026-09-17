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
  // 5. Seed National Banks
  const banksData = [
    { code: '0102', name: 'Banco de Venezuela, S.A. Banco Universal', rif: 'G200099976', filename: 'bdv.png' },
    { code: '0104', name: 'Venezolano de Crédito, S.A. Banco Universal', rif: 'J000029709', filename: 'bvc.png' },
    { code: '0105', name: 'Mercantil Banco, C.A. Banco Universal', rif: 'J000029610', filename: 'mercantil.png' },
    { code: '0108', name: 'BBVA Provincial, S.A. Banco Universal', rif: 'J000029679', filename: 'bbva-provincial.png' },
    { code: '0114', name: 'Bancaribe C.A. Banco Universal', rif: 'J000029490', filename: 'bancaribe.png' },
    { code: '0115', name: 'Banco Exterior C.A. Banco Universal', rif: 'J000029504', filename: 'banco-exterior.png' },
    { code: '0128', name: 'Banco Caroní C.A. Banco Universal', rif: 'J095048551', filename: 'banco-caroni.png' },
    { code: '0134', name: 'Banesco, Banco Universal S.A.C.A.', rif: 'J070133805', filename: 'banesco.png' },
    { code: '0137', name: 'Banco Sofitasa, Banco Universal', rif: 'J090283846', filename: 'sofitasa.png' },
    { code: '0138', name: 'Banco Plaza, Banco Universal', rif: 'J002970553', filename: 'banco-plaza.png' },
    { code: '0146', name: 'Bangente C.A', rif: 'J301442040', filename: 'bangente.png' },
    { code: '0151', name: 'BFC Banco Fondo Común C.A. Banco Universal', rif: 'J000723060', filename: 'bfc-banco-fondo-comun.png' },
    { code: '0156', name: '100% Banco, Banco Universal C.A.', rif: 'J085007768', filename: '100_banco.png' },
    { code: '0157', name: 'DelSur Banco Universal C.A.', rif: 'J000797234', filename: 'delsur.png' },
    { code: '0163', name: 'Banco del Tesoro, C.A. Banco Universal', rif: 'G200051876', filename: 'banco-del-tesoro.png' },
    { code: '0166', name: 'Banco Agrícola de Venezuela, C.A. Banco Universal', rif: 'G200057955', filename: 'banco-agricola.png' },
    { code: '0168', name: 'Bancrecer, S.A. Banco Microfinanciero', rif: 'J316374173', filename: 'bancrecer.png' },
    { code: '0169', name: 'Mi Banco, Banco Microfinanciero, C.A.', rif: 'J315941023', filename: 'mibanco.png' },
    { code: '0171', name: 'Banco Activo, Banco Universal', rif: 'J080066227', filename: 'activo.png' },
    { code: '0172', name: 'Bancamiga, Banco Universal C.A.', rif: 'J316287599', filename: 'bancamiga.png' },
    { code: '0173', name: 'Banco Internacional de Desarrollo, C.A. Banco Universal', rif: 'J294640109', filename: 'banco-internacional-de-desarrollo.png' },
    { code: '0174', name: 'Banplus Banco Universal, C.A', rif: 'J000423032', filename: 'banplus.png' },
    { code: '0007', name: 'Banco Digital de Los Trabajadores, Banco Universal, C.A.', rif: 'G200091487', filename: 'banco-digital-trabajadores.png' },
    { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana, B.U.', rif: 'G200106573', filename: 'banfanb.png' },
    { code: '0178', name: 'N58 Banco Digital, S.A. Banco Microfinanciero S.A.', rif: 'J503581107', filename: 'n58-banco.png' },
    { code: '0191', name: 'Banco Nacional de Crédito, C.A. Banco Universal', rif: 'J309841327', filename: 'Banco_Nacional_de_Credito.png' },
    { code: '0601', name: 'Instituto Municipal de Crédito Popular', rif: 'J000145903', filename: 'imcp.png' },
  ];

  for (const bank of banksData) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: {
        name: bank.name,
        rif: bank.rif,
        filename: bank.filename,
        isNational: true,
        isActive: true,
      },
      create: {
        code: bank.code,
        name: bank.name,
        rif: bank.rif,
        filename: bank.filename,
        isNational: true,
        isActive: true,
      },
    });
  }

  console.log(`✅ Banks seeded/verified: ${banksData.length} national banks`);

  // 6. Seed International Banks
  const intlBanksData = [
    { code: 'EXT001', name: 'Facebank', rif: 'N/A', filename: 'facebank.png' },
    { code: 'EXT002', name: 'Bank of America', rif: 'N/A', filename: 'boa.png' },
    { code: 'EXT003', name: 'Airtm', rif: 'N/A', filename: 'airtm.png' },
    { code: 'EXT004', name: 'Zinli', rif: 'N/A', filename: 'zinli.png' },
    { code: 'EXT005', name: 'Banesco Panamá', rif: 'N/A', filename: 'banesco-panama.png' },
    { code: 'EXT006', name: 'Mercantil Panamá', rif: 'N/A', filename: 'mercantil-panama.png' },
    { code: 'EXT007', name: 'Binance', rif: 'N/A', filename: 'binance.png' },
  ];

  for (const bank of intlBanksData) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: {
        name: bank.name,
        rif: bank.rif,
        filename: bank.filename,
        isNational: false,
        isActive: true,
      },
      create: {
        code: bank.code,
        name: bank.name,
        rif: bank.rif,
        filename: bank.filename,
        isNational: false,
        isActive: true,
      },
    });
  }

  console.log(`✅ Banks seeded/verified: ${intlBanksData.length} international banks`);
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
