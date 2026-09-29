import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone ?? undefined,
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      phone: savedUser.phone,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName;
    }

    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName;
    }

    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone;
    }

    const savedUser = await this.usersRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      phone: savedUser.phone,
      isActive: savedUser.isActive,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}