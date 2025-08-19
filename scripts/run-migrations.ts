import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function runMigrations() {
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
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');
    
    const migrations = await dataSource.migrations;
    const executedMigrations = await dataSource.query('SELECT * FROM migrations');
    console.log(`Found ${migrations.length} total migration(s).`);
    console.log(`Found ${executedMigrations.length} executed migration(s).`);
    
    await dataSource.runMigrations();
    console.log('All migrations have been executed successfully.');
    
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await dataSource.destroy();
  }
}

runMigrations();
