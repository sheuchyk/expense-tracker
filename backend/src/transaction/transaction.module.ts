import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionRepository } from './transaction.repository';
import { TransactionController } from './transaction.controller';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [TransactionController],
  providers: [TransactionRepository, ...CommandHandlers, ...QueryHandlers],
})
export class TransactionModule {}
