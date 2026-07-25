import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { Orchestrator } from '../../orchestrator';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import cookieParser from 'cookie-parser';

describe('Gender (e2e)', () => {
  let app: INestApplication<App>;
  const orchestrator = new Orchestrator();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await orchestrator.resetPrismaDatabase();
  });

  afterAll(async () => {
    await app.close();
    await orchestrator.destroy();
  });

  describe('Create (POST)', () => {
    it('should return a new Gender', async () => {});
  });
});
