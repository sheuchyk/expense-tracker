import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetCategoryByIdQuery } from '../get-category-by-id.query';
import { CategoryRepository } from '../../category.repository';
import { Category } from '@prisma/client';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoryByIdQuery): Promise<Category> {
    const category = await this.categoryRepository.findByIdForUser(query.id, query.userId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
