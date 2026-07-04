import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global module exposing a shared {@link PrismaService} instance. Marked
 * `@Global()` so any feature module (transactions, users, …) can inject
 * `PrismaService` without importing this module explicitly.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
