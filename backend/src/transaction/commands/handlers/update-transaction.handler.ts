import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateTransactionCommand } from '../update-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const existing = await this.transactionRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Transaction not found');
    return this.transactionRepository.update(command.id, command.userId, command.dto);
  }
}
