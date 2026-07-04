import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteTransactionCommand } from '../delete-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

/**
 * CQRS handler for {@link DeleteTransactionCommand}. Verifies ownership
 * before delegating to {@link TransactionRepository.delete}.
 */
@CommandHandler(DeleteTransactionCommand)
export class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Deletes the target transaction after asserting the caller owns it.
   *
   * @param command - Contains transaction `id` and `userId`.
   * @returns The deleted `Transaction` row.
   * @throws {NotFoundException} When no transaction with `id` belongs to `userId`.
   */
  async execute(command: DeleteTransactionCommand): Promise<Transaction> {
    const existing = await this.transactionRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Transaction not found');
    return this.transactionRepository.delete(command.id, command.userId);
  }
}
