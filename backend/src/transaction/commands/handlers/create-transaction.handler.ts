import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../create-transaction.command';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

/**
 * CQRS handler for {@link CreateTransactionCommand}. Delegates to
 * {@link TransactionRepository.create}.
 */
@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Persists a new transaction for the command's user.
   *
   * @param command - Contains `userId` and the validated create DTO.
   * @returns The created `Transaction` row.
   * @throws {Prisma.PrismaClientKnownRequestError} On DB constraint violations
   *   (e.g. unknown `categoryId`).
   */
  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    return this.transactionRepository.create(command.userId, command.dto);
  }
}
