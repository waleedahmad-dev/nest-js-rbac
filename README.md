# NestJS CRUD Application with Authentication & RBAC

A comprehensive NestJS application featuring JWT authentication, Role-Based Access Control (RBAC), password reset functionality, email notifications, and full CRUD operations for user management, roles, and permissions.

## Features

- 🔐 **JWT Authentication** - Login/Register with JWT tokens
- 👥 **User Management** - Complete CRUD operations for users
- 🛡️ **Role-Based Access Control** - Fine-grained permissions system
- 📧 **Email Integration** - Password reset & notifications with Handlebars templates
- 🔄 **Password Reset** - Secure token-based password reset workflow
- 📊 **Pagination & Search** - Advanced filtering and pagination
- 📚 **Swagger Documentation** - Complete API documentation
- 🔍 **Logging & Error Handling** - Comprehensive logging and error management
- 🗄️ **TypeORM Integration** - Database migrations and seeding
- ✅ **Validation** - Request/response validation with class-validator
- 🏗️ **Modular Architecture** - Well-organized module structure in `src/modules/`

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport (Local & JWT strategies)
- **Email**: @nestjs-modules/mailer with Handlebars templates
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Testing**: Jest (setup included)
- **Architecture**: Modular design with organized `src/modules/` structure

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=nestjs_crud_app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
APP_PORT=3000
NODE_ENV=development

# Swagger Configuration
SWAGGER_TITLE=NestJS CRUD API
SWAGGER_DESCRIPTION=A comprehensive CRUD API with authentication and RBAC
SWAGGER_VERSION=1.0

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@nestjs-app.com
MAIL_TRANSPORT=smtp://your-email%40gmail.com:your-app-password@smtp.gmail.com:587

# Password Reset Configuration
RESET_PASSWORD_TOKEN_EXPIRY=3600
RESET_PASSWORD_URL=http://localhost:3000/auth/reset-password
```

> **Note**: For Gmail SMTP, you'll need to use an App Password instead of your regular password. Enable 2FA and generate an App Password in your Google Account settings.

### 3. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE nestjs_crud_app;
```

### 4. Run Migrations & Seed Data

```bash
# Generate and run migrations
npm run migration:generate -- src/migrations/InitialMigration
npm run migration:run

# Seed initial data (creates admin user and default roles/permissions)
npm run seed
```

### 5. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit:
- **API Documentation**: http://localhost:3000/api
- **Application**: http://localhost:3000

## Default Admin User

After seeding, you can login with:
- **Email**: admin@example.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user profile
- `POST /auth/forgot-password` - Request password reset email
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/validate-reset-token/:token` - Validate reset token

### Users Management
- `GET /users` - Get all users (paginated)
- `POST /users` - Create new user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update current user profile
- `PATCH /users/profile/password` - Change password
- `POST /users/:id/roles` - Assign roles to user
- `DELETE /users/:id/roles` - Remove roles from user
- `PATCH /users/:id/toggle-status` - Toggle user active status

### Roles Management
- `GET /roles` - Get all roles (paginated)
- `POST /roles` - Create new role
- `GET /roles/:id` - Get role by ID
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Assign permissions to role
- `DELETE /roles/:id/permissions` - Remove permissions from role

### Permissions Management
- `GET /permissions` - Get all permissions (paginated)
- `POST /permissions` - Create new permission
- `GET /permissions/:id` - Get permission by ID
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

## Permission System

The application uses a resource-action based permission system:

### Default Permissions
- `users:create`, `users:read`, `users:update`, `users:delete`
- `roles:create`, `roles:read`, `roles:update`, `roles:delete`
- `permissions:create`, `permissions:read`, `permissions:update`, `permissions:delete`

### Using Permissions in Controllers

```typescript
@RequirePermissions('users:read')
@Get()
getAllUsers() {
  // Only users with 'users:read' permission can access this
}
```

## Database Commands

```bash
# Generate new migration
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Drop all database schema
npm run schema:drop

# Reset database (drop, migrate, seed)
npm run db:reset
```

## Project Structure

```
src/
├── modules/                # Application modules
│   ├── auth/              # Authentication module
│   ├── users/             # User management module
│   ├── roles/             # Role management module
│   ├── permissions/       # Permission management module
│   └── mail/              # Email service module
├── common/                # Shared components
│   ├── decorators/        # Custom decorators
│   ├── dto/              # Data transfer objects
│   ├── filters/          # Exception filters
│   ├── guards/           # Authorization guards
│   ├── helpers/          # Utility helpers
│   └── interceptors/     # Request/response interceptors
├── config/               # Configuration files
├── entities/             # TypeORM entities
├── migrations/           # Database migrations
└── seeders/             # Database seeders
```

## Development

```bash
# Start in watch mode
npm run start:dev

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Authentication Flow

1. **Register/Login** - User provides credentials
2. **JWT Token** - Server returns JWT token on successful authentication
3. **Authorization Header** - Client includes token in `Authorization: Bearer <token>` header
4. **Permission Check** - Server validates token and checks user permissions for each request

## Password Reset Flow

1. **Request Reset** - User provides email at `POST /auth/forgot-password`
2. **Email Sent** - System sends password reset email with secure token
3. **Token Validation** - User clicks link or validates token at `GET /auth/validate-reset-token/:token`
4. **Password Update** - User submits new password at `POST /auth/reset-password`
5. **Confirmation** - System sends password change confirmation email

### Email Templates

The application includes professional Handlebars email templates:
- **Password Reset** (`forgot-password.hbs`) - Clean, responsive design with reset button
- **Password Changed** (`password-changed.hbs`) - Confirmation notification
- **Welcome Email** (`welcome.hbs`) - New user onboarding

Templates are located in `src/modules/mail/templates/` and support:
- Responsive design for mobile/desktop
- Brand customization
- Dynamic content injection
- Professional styling

## Error Handling

The application includes comprehensive error handling:
- **Global Exception Filter** - Catches and formats all exceptions
- **Validation Errors** - Automatic validation with detailed error messages
- **HTTP Status Codes** - Proper status codes for different scenarios
- **Logging** - All requests and errors are logged
- **Email Retry Logic** - Automatic retry mechanism for failed email sends

## Recent Improvements

### ✅ Fixed Issues
- **Template Path Resolution** - Fixed Handlebars template loading in production/development
- **Module Organization** - Reorganized code into clean `src/modules/` structure
- **Import Path Fixes** - Resolved all relative import path issues
- **Email Service** - Implemented robust email service with retry logic
- **Password Reset** - Complete secure password reset workflow

### 🏗️ Architecture Enhancements
- **Modular Design** - Clean separation of concerns with dedicated modules
- **Error Handling** - Comprehensive error handling and logging
- **Email Templates** - Professional responsive email templates
- **Security** - Secure token-based password reset system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## Troubleshooting

### Common Issues

**Email not sending?**
- Verify SMTP credentials in `.env`
- For Gmail, use App Password (not regular password)
- Check firewall/antivirus blocking port 587

**Template errors?**
- Templates are loaded from `src/modules/mail/templates/`
- Ensure templates exist: `forgot-password.hbs`, `password-changed.hbs`
- Check file permissions

**Import path errors?**
- All modules are in `src/modules/` directory
- Use relative paths like `../../entities/` for cross-module imports
- Restart development server after path changes

**Database connection issues?**
- Ensure MySQL is running
- Verify database credentials in `.env`
- Create database: `CREATE DATABASE nestjs_crud_app;`

### Getting Help

- Check the terminal output for detailed error messages
- Enable debug logging by setting `NODE_ENV=development`
- Review the Swagger documentation at http://localhost:3000/api
- Check the application logs for specific error details
