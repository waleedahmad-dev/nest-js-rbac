import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      return false;
    }

    // Extract all permissions from user's roles
    const userPermissions = user.roles.reduce((permissions, role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          const permissionName = `${permission.resource}:${permission.action}`;
          permissions.add(permissionName);
        });
      }
      return permissions;
    }, new Set<string>());

    return requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
