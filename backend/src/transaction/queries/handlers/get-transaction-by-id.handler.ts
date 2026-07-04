import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetTransactionByIdQuery } from '../get-transaction-by-id.query';
import { TransactionRepository } from '../../transaction.repository';
import { Transaction } from '@prisma/client';

/**
 * CQRS handler for {@link GetTransactionByIdQuery}. Loads a single
 * transaction and enforces ownership.
 */
@QueryHandler(GetTransactionByIdQuery)
export class GetTransactionByIdHandler implements IQueryHandler<GetTransactionByIdQuery> {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  /**
   * Returns the requested transaction if it belongs to the calling user.
   *
   * @param query - Contains transaction `id` and expected `userId`.
   * @returns The matching `Transaction` row.
   * @throws {NotFoundException} When no transaction with `id` belongs to `userId`.
   */
  async execute(query: GetTransactionByIdQuery): Promise<Transaction> {
    const transaction = await this.transactionRepository.findByIdForUser(query.id, query.userId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }
}
