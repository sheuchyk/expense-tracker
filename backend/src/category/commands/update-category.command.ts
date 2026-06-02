import { UpdateCategoryDto } from '../dto/update-category.dto';

export class UpdateCategoryCommand {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly dto: UpdateCategoryDto,
  ) {}
}
