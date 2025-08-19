import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetFields1755632591579 implements MigrationInterface {
    name = 'AddPasswordResetFields1755632591579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordToken\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordExpires\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordToken\``);
    }

}
