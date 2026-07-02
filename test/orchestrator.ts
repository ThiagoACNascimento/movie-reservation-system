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

export class Orchestrator extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter, omit: { user: { password: true } } });
  }

  async resetPrismaDatabase(): Promise<void> {
    this.guardAgainstNonTestDatabase();

    execSync('npx prisma migrate reset --force', {
      env: { ...process.env },
      stdio: 'inherit',
    });

    await this.$connect();
  }

  private guardAgainstNonTestDatabase(): void {
    const url = process.env.DATABASE_URL ?? '';
    if (!url.includes('test')) {
      throw new Error(
        `Recusando resetar um banco que não parece ser de teste: ${url}`,
      );
    }
  }

  async createUser(userCreate?: UserCreateInterface): Promise<User> {
    const password = userCreate?.password ?? faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 1);

    return this.user.create({
      data: {
        name: userCreate?.name ?? faker.person.fullName(),
        email: userCreate?.email ?? faker.internet.email(),
        password: hashedPassword,
      },
    });
  }

  async createManyUsers(
    count: number,
    userCreate?: UserCreateInterface,
  ): Promise<User[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.createUser(userCreate)),
    );
  }

  async truncateAll(): Promise<void> {
    const tables = await this.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await this.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      }
    }
  }

  async destroy(): Promise<void> {
    await this.$disconnect();
  }
}
