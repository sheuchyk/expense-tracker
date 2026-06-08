export class GetTransactionByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
