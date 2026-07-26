import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { Orchestrator } from '../../orchestrator';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { Genre } from '../../../src/generated/prisma/client';
import cookieParser from 'cookie-parser';
import { PaginationResult } from '../../../src/common/interfaces/pagination-result.interface';

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
    it('should return an Unauthorized exception when user are not loggin', async () => {
      const gender = await request(app.getHttpServer())
        .post('/genres')
        .send({
          name: 'Action',
        })
        .expect(401);

      expect(gender.body).toEqual({
        message: 'You are not logging',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should return a Forbidden exception when default user try create a gender', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const cookies = await orchestrator.login(app, {
        email: user.email,
        password: '12345678',
      });
      const gender = await request(app.getHttpServer())
        .post('/genres')
        .set('Cookie', cookies)
        .send({
          name: 'Action',
        })
        .expect(403);

      expect(gender.body).toEqual({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    });

    it('should return a BadRequest exception when try create an exists genre', async () => {
      const user = await orchestrator.createUser(
        { password: '12345678' },
        false,
        true,
      );
      const cookies = await orchestrator.login(app, {
        email: user.email,
        password: '12345678',
      });
      await orchestrator.createGenre({ name: 'Action' });
      const gender = await request(app.getHttpServer())
        .post('/genres')
        .set('Cookie', cookies)
        .send({
          name: 'Action',
        })
        .expect(400);

      expect(gender.body).toEqual({
        message: 'Genre aready exist',
        error: 'Bad Request',
        statusCode: 400,
      });
    });

    it('should return a new Gender', async () => {
      const user = await orchestrator.createUser(
        { password: '12345678' },
        false,
        true,
      );
      const cookies = await orchestrator.login(app, {
        email: user.email,
        password: '12345678',
      });
      const gender = (await request(app.getHttpServer())
        .post('/genres')
        .set('Cookie', cookies)
        .send({
          name: 'Action',
        })
        .expect(201)) as { body: Genre };

      expect(gender.body).toEqual({
        id: gender.body.id,
        name: gender.body.name,
      });
    });
  });

  describe('Found (GET)', () => {
    describe('Many', () => {
      describe('Public', () => {
        it('should return empty array', async () => {
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body).toEqual({
            data: [],
            meta: {
              lastPage: 0,
              limit: result.body.meta.limit,
              next: null,
              page: 1,
              prev: null,
              total: 0,
            },
          });
        });

        it('should return an array with 2 genres', async () => {
          await orchestrator.createGenre([
            { name: 'Action' },
            { name: 'Drama' },
          ]);
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body.data.length).toBeGreaterThan(1);
          expect(result.body.data.length).toBeLessThan(3);
        });
      });

      describe('Default User', () => {
        it('should return empty array', async () => {
          const cookies = await orchestrator.createUserAndLogin(app);
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .set('Cookie', cookies)
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body).toEqual({
            data: [],
            meta: {
              lastPage: 0,
              limit: result.body.meta.limit,
              next: null,
              page: 1,
              prev: null,
              total: 0,
            },
          });
        });

        it('should return an array with 2 genres', async () => {
          const cookies = await orchestrator.createUserAndLogin(app);
          await orchestrator.createGenre([
            { name: 'Action' },
            { name: 'Drama' },
          ]);
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .set('Cookie', cookies)
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body.data.length).toBeGreaterThan(1);
          expect(result.body.data.length).toBeLessThan(3);
        });
      });

      describe('Admin User', () => {
        it('should return empty array', async () => {
          const cookies = await orchestrator.createUserAndLogin(app, true);
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .set('Cookie', cookies)
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body).toEqual({
            data: [],
            meta: {
              lastPage: 0,
              limit: result.body.meta.limit,
              next: null,
              page: 1,
              prev: null,
              total: 0,
            },
          });
        });

        it('should return an array with 2 genres', async () => {
          const cookies = await orchestrator.createUserAndLogin(app, true);
          await orchestrator.createGenre([
            { name: 'Action' },
            { name: 'Drama' },
          ]);
          const result = (await request(app.getHttpServer())
            .get('/genres')
            .set('Cookie', cookies)
            .expect(200)) as { body: PaginationResult<Genre> };

          expect(Array.isArray(result.body.data)).toBe(true);
          expect(result.body.data.length).toBeGreaterThan(1);
          expect(result.body.data.length).toBeLessThan(3);
        });
      });
    });
  });
});
