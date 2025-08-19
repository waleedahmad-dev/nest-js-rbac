import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

config();

async function generateMigration() {
  const migrationName = process.argv[2] || 'Migration';
  
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nestjs_crud_app',
    entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../src/migrations/*{.ts,.js}')],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
    const fileName = `${timestamp}_${migrationName}.ts`;
    const filePath = path.join(__dirname, '../src/migrations', fileName);
    
    // Ensure migrations directory exists
    const migrationsDir = path.join(__dirname, '../src/migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Check if there are any schema changes
    const sqlInMemory = await dataSource.driver.createSchemaBuilder().log();
    
    if (sqlInMemory.upQueries.length === 0) {
      console.log('No changes in database schema were found - cannot generate a migration.');
      return;
    }
    
    // Generate migration content
    const upQueries = sqlInMemory.upQueries.map(query => `        await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`);`).join('\n');
    const downQueries = sqlInMemory.downQueries.map(query => `        await queryRunner.query(\`${query.query.replace(/`/g, '\\`')}\`);`).join('\n');
    
    const content = `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${migrationName}${timestamp} implements MigrationInterface {
    name = '${migrationName}${timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {
${upQueries}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
${downQueries}
    }
}
`;
    
    fs.writeFileSync(filePath, content);
    console.log(`Migration ${fileName} has been generated successfully.`);
    
  } catch (error) {
    console.error('Error generating migration:', error);
  } finally {
    await dataSource.destroy();
  }
}

generateMigration();
