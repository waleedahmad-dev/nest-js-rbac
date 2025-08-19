import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

export async function seedDatabase(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);

  // Create permissions
  const permissions = [
    // User permissions
    {
      name: 'users:create',
      description: 'Create users',
      resource: 'users',
      action: 'create',
    },
    {
      name: 'users:read',
      description: 'Read users',
      resource: 'users',
      action: 'read',
    },
    {
      name: 'users:update',
      description: 'Update users',
      resource: 'users',
      action: 'update',
    },
    {
      name: 'users:delete',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },

    // Role permissions
    {
      name: 'roles:create',
      description: 'Create roles',
      resource: 'roles',
      action: 'create',
    },
    {
      name: 'roles:read',
      description: 'Read roles',
      resource: 'roles',
      action: 'read',
    },
    {
      name: 'roles:update',
      description: 'Update roles',
      resource: 'roles',
      action: 'update',
    },
    {
      name: 'roles:delete',
      description: 'Delete roles',
      resource: 'roles',
      action: 'delete',
    },

    // Permission permissions
    {
      name: 'permissions:create',
      description: 'Create permissions',
      resource: 'permissions',
      action: 'create',
    },
    {
      name: 'permissions:read',
      description: 'Read permissions',
      resource: 'permissions',
      action: 'read',
    },
    {
      name: 'permissions:update',
      description: 'Update permissions',
      resource: 'permissions',
      action: 'update',
    },
    {
      name: 'permissions:delete',
      description: 'Delete permissions',
      resource: 'permissions',
      action: 'delete',
    },
  ];

  const savedPermissions: Permission[] = [];
  for (const permissionData of permissions) {
    let permission = await permissionRepository.findOne({
      where: { name: permissionData.name },
    });
    if (!permission) {
      permission = permissionRepository.create(permissionData);
      permission = await permissionRepository.save(permission);
    }
    savedPermissions.push(permission);
  }

  // Create roles
  let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = roleRepository.create({
      name: 'admin',
      description: 'Administrator with full access',
      permissions: savedPermissions,
    });
    adminRole = await roleRepository.save(adminRole);
  }

  let userRole = await roleRepository.findOne({ where: { name: 'user' } });
  if (!userRole) {
    userRole = roleRepository.create({
      name: 'user',
      description: 'Regular user with limited access',
      permissions: [],
    });
    userRole = await roleRepository.save(userRole);
  }

  // Create admin user
  let adminUser = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });
  if (!adminUser) {
    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isEmailVerified: true,
      roles: [adminRole],
    });
    await userRepository.save(adminUser);
  }

  console.log('Database seeded successfully!');
}

// Main execution
async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nestjs_crud_app',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');
    await seedDatabase(dataSource);
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  config();
  void main();
}
