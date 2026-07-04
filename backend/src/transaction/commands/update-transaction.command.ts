import { UpdateTransactionDto } from '../dto/update-transaction.dto';

/**
 * CQRS command instructing the bus to update an existing transaction.
 * Handled by `UpdateTransactionHandler`.
 */
export class UpdateTransactionCommand {
  /**
   * @param id - Id of the transaction to update.
   * @param userId - Expected owner; enforces per-user isolation.
   * @param dto - Partial update payload.
   */
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly dto: UpdateTransactionDto,
  ) {}
}
