import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionRepository } from './transaction.repository';
import { TransactionController } from './transaction.controller';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

/**
 * Feature module bundling the transactions HTTP controller, the repository,
 * and all CQRS command/query handlers.
 *
 * Registered globally via `AppModule`. Relies on `PrismaModule` (global) for
 * database access and on `CqrsModule` for the command/query buses.
 */
@Module({
  imports: [CqrsModule],
  controllers: [TransactionController],
  providers: [TransactionRepository, ...CommandHandlers, ...QueryHandlers],
})
export class TransactionModule {}
