import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserRepository } from '../user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(command.password, 10);
    const user = await this.userRepository.create({
      name: command.name,
      email: command.email,
      password: hashedPassword,
    });
    const { password: _, ...result } = user;
    return result;
  }
}
