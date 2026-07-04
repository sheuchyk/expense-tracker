import { CreateTransactionDto } from '../dto/create-transaction.dto';

/**
 * CQRS command instructing the bus to persist a new transaction.
 * Handled by `CreateTransactionHandler`.
 */
export class CreateTransactionCommand {
  /**
   * @param userId - Owner the new transaction should belong to.
   * @param dto - Validated create payload.
   */
  constructor(
    public readonly userId: number,
    public readonly dto: CreateTransactionDto,
  ) {}
}
