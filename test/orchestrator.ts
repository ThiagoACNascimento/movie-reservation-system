import { PrismaClient, User } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

interface UserCreateInterface {
  name?: string;
  email?: string;
  password?: string;
}

interface Login {
  email: string;
  password: string;
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

    const tables = await this.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

    const tableNames = tables
      .map(({ tablename }) => `"public"."${tablename}"`)
      .join(', ');

    if (tableNames) {
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    }
  }

  private guardAgainstNonTestDatabase(): void {
    const url = process.env.DATABASE_URL ?? '';
    if (!url.includes('test')) {
      throw new Error(
        `Recusando resetar um banco que não parece ser de teste: ${url}`,
      );
    }
  }

  async createUser(
    userCreate?: UserCreateInterface,
    isAdmin: boolean = false,
  ): Promise<User> {
    const password = userCreate?.password ?? faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 1);

    let user = await this.user.create({
      data: {
        name: userCreate?.name ?? faker.person.fullName(),
        email: userCreate?.email ?? faker.internet.email(),
        password: hashedPassword,
      },
    });

    if (isAdmin) {
      user = await this.user.update({
        where: { id: user.id },
        data: {
          role: 'admin',
        },
      });
    }

    return user;
  }

  async login(app: INestApplication<App>, login: Login) {
    const result = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: login.email,
        password: login.password,
      })
      .expect(200);

    return result.headers['set-cookie'] as unknown as string[];
  }

  async createUserWithoutDatabase(userCreate?: UserCreateInterface) {
    const password = userCreate?.password ?? faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 1);

    return {
      data: {
        name: userCreate?.name ?? faker.person.fullName(),
        email: userCreate?.email ?? faker.internet.email(),
        password: hashedPassword,
      },
    };
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

  async deleteUser(id: string) {
    await this.user.delete({ where: { id } });
  }

  async destroy(): Promise<void> {
    await this.$disconnect();
  }
}
