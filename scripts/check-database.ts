import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function checkDatabaseStatus() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nestjs_crud_app',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established successfully.');
    
    // Check if tables exist
    const tables = ['users', 'roles', 'permissions', 'user_roles', 'role_permissions'];
    
    for (const tableName of tables) {
      try {
        const result = await dataSource.query(`SHOW TABLES LIKE '${tableName}'`);
        if (result.length > 0) {
          const count = await dataSource.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`✅ Table '${tableName}' exists with ${count[0].count} records`);
        } else {
          console.log(`❌ Table '${tableName}' does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${tableName}':`, error.message);
      }
    }

    console.log('\n🔍 Database Schema Status:');
    console.log('- Tables created via TypeORM synchronize=true');
    console.log('- Migration system available but not required for current setup');
    console.log('- For production: use synchronize=false and proper migrations');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

checkDatabaseStatus().catch(console.error);
