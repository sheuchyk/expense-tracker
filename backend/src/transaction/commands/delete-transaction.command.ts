export class DeleteTransactionCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
