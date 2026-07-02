import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';

export class Orquestrator extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter, omit: { user: { password: true } } });
  }

  async resetPrismaDatabase() {
    await this.$connect();
    execSync('npx prisma migrate reset --force', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });
  }

  async createNewUser() {
    const hashedPassoword = await bcrypt.hash('12345678', 1);
    return this.user.create({
      data: {
        name: 'newUserCreated',
        email: 'newUser@gmail.com',
        password: hashedPassoword,
      },
    });
  }

  async destroy() {
    await this.$disconnect();
  }
}
