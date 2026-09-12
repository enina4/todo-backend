import {  ForbiddenException,
	  Injectable,
	  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';
import { toSafeUser, toSafeUsers } from '../domain/user.entity';
import { NotificationPort } from 'src/contexts/tasks/todo/domain/notification.port';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationPort: NotificationPort,
  ) {}

  async findAll() {
    const users = await this.userRepository.findAll();
    return toSafeUsers(users);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return toSafeUser(user);
  }

  async create(dto: CreateUserDto, userId: string) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: 'CLIENT',
      status: 'ACTIVE',
    });

    await this.notificationPort.send({
      userId,
      type: 'TASK_CREATED',
      title: 'Nuevo usuario',
      message: `Se creó el usuario "${dto.name}"`,
      metadata: { user: toSafeUser(user) },
    });

    return toSafeUser(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: { id: string; role: string },
  ) {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const isOwner = currentUser.id === id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You can only update your own user unless you are an admin',
      );
    }

    if (!isAdmin) {
      delete dto.role;
      delete dto.status;
    }

    if (dto.email && dto.email !== existing.email) {
      const emailOwner = await this.userRepository.findByEmail(dto.email);

      if (emailOwner) {
        throw new Error('User with this email already exists');
      }
    }

    const updated = await this.userRepository.update(id, dto);

    return toSafeUser(updated);
  }

  async delete(id: string, currentUser: { role: string }) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete users');
    }

    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.delete(id);

    return {
      message: 'User deleted successfully',
    };
  }
}
