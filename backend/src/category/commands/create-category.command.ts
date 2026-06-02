import { CreateCategoryDto } from '../dto/create-category.dto';

export class CreateCategoryCommand {
  constructor(
    public readonly userId: number,
    public readonly dto: CreateCategoryDto,
  ) {}
}
