import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationHelper } from '../../common/helpers/pagination.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get roles if provided, otherwise assign default user role
    let roles: Role[] = [];
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      roles = await this.roleRepository.find({
        where: { id: In(createUserDto.roleIds) },
      });

      if (roles.length !== createUserDto.roleIds.length) {
        throw new BadRequestException('Some roles not found');
      }
    } else {
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (defaultRole) {
        roles = [defaultRole];
      }
    }

    const user = this.userRepository.create({
      email: createUserDto.email,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      avatar: createUserDto.avatar,
      isActive: createUserDto.isActive,
      isEmailVerified: createUserDto.isEmailVerified,
      roles,
    });

    return this.userRepository.save(user);
  }

  async findAll(paginationDto: PaginationDto) {
    return PaginationHelper.paginate(
      this.userRepository,
      paginationDto,
      ['firstName', 'lastName', 'email'],
      ['roles'],
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update roles if provided
    if (updateUserDto.roleIds !== undefined) {
      if (updateUserDto.roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(updateUserDto.roleIds) },
        });

        if (roles.length !== updateUserDto.roleIds.length) {
          throw new BadRequestException('Some roles not found');
        }

        user.roles = roles;
      } else {
        user.roles = [];
      }
    }

    // Update other fields
    Object.assign(user, {
      email: updateUserDto.email ?? user.email,
      firstName: updateUserDto.firstName ?? user.firstName,
      lastName: updateUserDto.lastName ?? user.lastName,
      phoneNumber: updateUserDto.phoneNumber ?? user.phoneNumber,
      avatar: updateUserDto.avatar ?? user.avatar,
      isActive: updateUserDto.isActive ?? user.isActive,
      isEmailVerified: updateUserDto.isEmailVerified ?? user.isEmailVerified,
    });

    return this.userRepository.save(user);
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(
      updatePasswordDto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = updatePasswordDto.newPassword;
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async assignRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.findOne(userId);

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Some roles not found');
    }

    user.roles = roles;
    return this.userRepository.save(user);
  }

  async removeRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.findOne(userId);

    user.roles = user.roles.filter((role) => !roleIds.includes(role.id));

    return this.userRepository.save(user);
  }

  async toggleUserStatus(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }
}
