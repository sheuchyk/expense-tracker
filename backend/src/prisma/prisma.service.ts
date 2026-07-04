import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Injectable Prisma client bound to the Nest lifecycle. Extends `PrismaClient`
 * so every model (`prisma.transaction`, `prisma.user`, …) is available directly
 * on the service instance.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Opens the underlying database connection when the Nest module boots.
   *
   * @returns Resolves once the connection is established.
   * @throws {Error} When Prisma fails to connect (e.g. bad `DATABASE_URL`).
   */
  async onModuleInit() {
    await this.$connect();
  }
}
