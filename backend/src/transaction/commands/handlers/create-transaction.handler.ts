import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../create-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    return this.transactionRepository.create(command.userId, command.dto);
  }
}
