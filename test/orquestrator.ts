import { PrismaClient, User } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

interface UserCreateInterface {
  name?: string;
  email?: string;
  password?: string;
}

export class Orquestrator extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter, omit: { user: { password: true } } });
  }

  async resetPrismaDatabase(): Promise<void> {
    await this.$connect();
    execSync('npx prisma migrate reset --force', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });
  }

  async createNewUser(userCreate?: UserCreateInterface): Promise<User> {
    const password = userCreate?.password ?? faker.internet.password();
    const hashedPassoword = await bcrypt.hash(password, 1);
    return this.user.create({
      data: {
        name: userCreate?.name ?? faker.person.fullName(),
        email: userCreate?.password ?? faker.internet.email(),
        password: hashedPassoword,
      },
    });
  }

  async destroy() {
    await this.$disconnect();
  }
}
