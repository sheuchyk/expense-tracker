import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCategoriesByUserQuery } from '../get-categories-by-user.query';
import { CategoryRepository } from '../../category.repository';
import { Category } from '@prisma/client';

@QueryHandler(GetCategoriesByUserQuery)
export class GetCategoriesByUserHandler implements IQueryHandler<GetCategoriesByUserQuery> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesByUserQuery): Promise<Category[]> {
    return this.categoryRepository.findAllByUser(query.userId);
  }
}
