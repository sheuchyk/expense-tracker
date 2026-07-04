import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateTransactionCommand } from '../update-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

/**
 * CQRS handler for {@link UpdateTransactionCommand}. Verifies ownership
 * before delegating to {@link TransactionRepository.update}.
 */
@CommandHandler(UpdateTransactionCommand)
export class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Updates the target transaction after asserting the caller owns it.
   *
   * @param command - Contains transaction `id`, `userId`, and update DTO.
   * @returns The updated `Transaction` row.
   * @throws {NotFoundException} When no transaction with `id` belongs to `userId`.
   */
  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    const existing = await this.transactionRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Transaction not found');
    return this.transactionRepository.update(command.id, command.userId, command.dto);
  }
}
