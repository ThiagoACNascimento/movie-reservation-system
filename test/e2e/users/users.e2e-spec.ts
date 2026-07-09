import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Orchestrator } from '../../orchestrator';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  const orchestrator = new Orchestrator();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await orchestrator.resetPrismaDatabase();
  });

  describe('Create User (POST)', () => {
    it('should return a new user', async () => {
      const result = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'firstNewUser',
          email: 'firstNewUser@gmail.com',
          password: '12345678',
        })
        .expect(201);

      expect(result.body).not.toHaveProperty('password');
      expect(result.body).toEqual({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: result.body.id,
        name: 'firstNewUser',
        email: 'firstNewUser@gmail.com',
        role: 'default',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        created_at: result.body.created_at,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        updated_at: result.body.updated_at,
      });
    });

    it('should throw `BadRequestException` when user aready exists', async () => {
      const user = await orchestrator.createUser();
      const result = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: user.name,
          email: user.email,
          password: '12345678',
        })
        .expect(400);

      expect(result.body).toEqual({
        message: 'Try create again',
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });

  describe('Return User (GET)', () => {
    describe('should return one user', () => {
      it('return successfuly', async () => {
        const user = await orchestrator.createUser();
        const result = await request(app.getHttpServer())
          .get(`/users/${user.id}`)
          .expect(200);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        expect(Date.parse(result.body.created_at)).not.toBeNaN();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        expect(Date.parse(result.body.updated_at)).not.toBeNaN();

        // IS THE BODY DIFFERENT FROM THE USER? WHY?
        expect(result.body).toEqual({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'default',
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        });
      });

      it('user not found', async () => {
        const result = await request(app.getHttpServer())
          .get('/users/b7981a90-7bf4-4c0b-983d-54cb7b9ee286')
          .expect(404);

        expect(result.body).toEqual({
          message: 'User not found',
          error: 'Not Found',
          statusCode: 404,
        });
      });
    });

    describe('should return all users', () => {
      it('return successfuly', async () => {
        await orchestrator.createManyUsers(5);
        const result = await request(app.getHttpServer())
          .get(`/users`)
          .expect(200);

        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body).not.toEqual([]);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.body.length).toBe(5);
      });

      it('return empty array', async () => {
        await orchestrator.resetPrismaDatabase();

        const result = await request(app.getHttpServer())
          .get(`/users`)
          .expect(200);

        expect(Array.isArray(result.body)).toEqual(true);
        expect(result.body).toEqual([]);
      });
    });
  });

  afterAll(async () => {
    await app.close();
    await orchestrator.destroy();
  });
});
