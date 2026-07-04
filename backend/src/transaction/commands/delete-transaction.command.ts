/**
 * CQRS command instructing the bus to delete a transaction.
 * Handled by `DeleteTransactionHandler`.
 */
export class DeleteTransactionCommand {
  /**
   * @param id - Id of the transaction to delete.
   * @param userId - Expected owner; enforces per-user isolation.
   */
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
