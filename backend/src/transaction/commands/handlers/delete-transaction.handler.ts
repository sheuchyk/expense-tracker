import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteTransactionCommand } from '../delete-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(command: DeleteTransactionCommand): Promise<Transaction> {
    const existing = await this.transactionRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Transaction not found');
    return this.transactionRepository.delete(command.id, command.userId);
  }
}
