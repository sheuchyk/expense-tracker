import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteCategoryCommand } from '../delete-category.command';
import { CategoryRepository } from '../../category.repository';
import { Category } from '@prisma/client';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(command: DeleteCategoryCommand): Promise<Category> {
    const existing = await this.categoryRepository.findByIdForUser(command.id, command.userId);
    if (!existing) throw new NotFoundException('Category not found');
    return this.categoryRepository.delete(command.id, command.userId);
  }
}
