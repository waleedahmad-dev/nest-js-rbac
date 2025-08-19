import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationHelper } from '../../common/helpers/pagination.helper';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.find({
        where: { id: In(createRoleDto.permissionIds) },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('Some permissions not found');
      }
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findAll(paginationDto: PaginationDto) {
    return PaginationHelper.paginate(
      this.roleRepository,
      paginationDto,
      ['name', 'description'],
      ['permissions'],
    );
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Check if name is being updated and if it already exists
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update permissions if provided
    if (updateRoleDto.permissionIds !== undefined) {
      if (updateRoleDto.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.find({
          where: { id: In(updateRoleDto.permissionIds) },
        });

        if (permissions.length !== updateRoleDto.permissionIds.length) {
          throw new BadRequestException('Some permissions not found');
        }

        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    // Update other fields
    Object.assign(role, {
      name: updateRoleDto.name ?? role.name,
      description: updateRoleDto.description ?? role.description,
      isActive: updateRoleDto.isActive ?? role.isActive,
    });

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);

    // Check if role is assigned to any users
    if (role.users && role.users.length > 0) {
      throw new BadRequestException(
        'Cannot delete role as it is assigned to users',
      );
    }

    await this.roleRepository.remove(role);
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    role.permissions = permissions;
    return this.roleRepository.save(role);
  }

  async removePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    role.permissions = role.permissions.filter(
      (permission) => !permissionIds.includes(permission.id),
    );

    return this.roleRepository.save(role);
  }
}
