import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';

import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private toSafeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll() {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) =>
      this.toSafeUser(user),
    );
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return this.toSafeUser(user);
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser =
      await this.usersRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone:
        createUserDto.phone ?? undefined,
      role: UserRole.CUSTOMER,
    });

    const savedUser =
      await this.usersRepository.save(user);

    return this.toSafeUser(savedUser);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user =
      await this.usersRepository.findOne({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (
      updateUserDto.email !== undefined
    ) {
      const existingUser =
        await this.usersRepository.findOne({
          where: {
            email: updateUserDto.email,
          },
        });

      if (
        existingUser &&
        existingUser.id !== id
      ) {
        throw new ConflictException(
          'A user with this email already exists',
        );
      }

      user.email =
        updateUserDto.email;
    }

    if (
      updateUserDto.firstName !== undefined
    ) {
      user.firstName =
        updateUserDto.firstName;
    }

    if (
      updateUserDto.lastName !== undefined
    ) {
      user.lastName =
        updateUserDto.lastName;
    }

    if (
      updateUserDto.phone !== undefined
    ) {
      user.phone =
        updateUserDto.phone;
    }

    const savedUser =
      await this.usersRepository.save(user);

    return this.toSafeUser(savedUser);
  }

  async updateRole(
    targetUserId: string,
    requestingUserId: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const targetUser =
      await this.usersRepository.findOne({
        where: {
          id: targetUserId,
        },
      });

    if (!targetUser) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (targetUser.id === requestingUserId) {
      throw new ForbiddenException(
        'You cannot change your own role',
      );
    }

    if (
      updateUserRoleDto.role === UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Administrator role cannot be assigned through this endpoint',
      );
    }

    targetUser.role =
      updateUserRoleDto.role;

    const savedUser =
      await this.usersRepository.save(
        targetUser,
      );

    return this.toSafeUser(savedUser);
  }
}