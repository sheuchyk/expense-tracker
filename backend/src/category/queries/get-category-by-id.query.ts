export class GetCategoryByIdQuery {
  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}
}
