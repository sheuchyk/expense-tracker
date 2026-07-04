/**
 * CQRS query requesting a single transaction by id, scoped to a user.
 * Handled by `GetTransactionByIdHandler`.
 */
export class GetTransactionByIdQuery {
  /**
   * @param id - Id of the transaction to load.
   * @param userId - Expected owner; enforces per-user isolation.
   */
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
