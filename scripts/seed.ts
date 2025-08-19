import { DataSource } from 'typeorm';
import { seedDatabase } from '../src/seeders/seed';
import dataSource from '../src/config/typeorm.config';

async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    await seedDatabase(dataSource);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

runSeed();
