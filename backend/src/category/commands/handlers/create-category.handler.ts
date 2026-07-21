import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryCommand } from '../create-category.command';
import { CategoryRepository } from '../../category.repository';
import { GetUserByIdQuery } from '../../../user/queries/get-user-by-id.query';
import { Category, User } from '@prisma/client';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    const user = await this.queryBus.execute<GetUserByIdQuery, User | null>(new GetUserByIdQuery(command.userId));
    if (!user) throw new NotFoundException('User not found');
    return this.categoryRepository.create(command.userId, command.dto);
  }
}
