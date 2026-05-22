import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de Prisma.
 * Al ser @Global(), PrismaService está disponible en toda la aplicación
 * sin necesidad de importar PrismaModule en cada módulo.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
