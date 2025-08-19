import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration20250820000000 implements MigrationInterface {
    name = 'InitialMigration20250820000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create permissions table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`permissions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`resource\` varchar(255) NOT NULL,
                \`action\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_48ce552495d14eae9b187bb671\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create roles table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`roles\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`firstName\` varchar(255) NOT NULL,
                \`lastName\` varchar(255) NOT NULL,
                \`phoneNumber\` varchar(255) NULL,
                \`avatar\` varchar(255) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isEmailVerified\` tinyint NOT NULL DEFAULT 0,
                \`lastLoginAt\` datetime NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create role_permissions junction table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`role_permissions\` (
                \`roleId\` int NOT NULL,
                \`permissionId\` int NOT NULL,
                INDEX \`IDX_b4599f8b8f548d35850afa2d12\` (\`roleId\`),
                INDEX \`IDX_06792d0c62ce6b0203c03643cd\` (\`permissionId\`),
                PRIMARY KEY (\`roleId\`, \`permissionId\`)
            ) ENGINE=InnoDB
        `);

        // Create user_roles junction table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`user_roles\` (
                \`userId\` int NOT NULL,
                \`roleId\` int NOT NULL,
                INDEX \`IDX_472b25323af01488f1f66a06b6\` (\`userId\`),
                INDEX \`IDX_86033897c009fcca8b6505d6be\` (\`roleId\`),
                PRIMARY KEY (\`userId\`, \`roleId\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`role_permissions\` 
            ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` 
            FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`role_permissions\` 
            ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` 
            FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\`(\`id\`) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_roles\` 
            ADD CONSTRAINT \`FK_472b25323af01488f1f66a06b67\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`user_roles\` 
            ADD CONSTRAINT \`FK_86033897c009fcca8b6505d6be2\` 
            FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_86033897c009fcca8b6505d6be2\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_472b25323af01488f1f66a06b67\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
    }
}
