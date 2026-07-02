import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';
import { Orquestrator } from '../../orquestrator';

describe('Status (e2e)', () => {
  let app: INestApplication<App>;
  const orchestrator = new Orquestrator();

  beforeAll(async () => {
    orchestrator.resetPrismaDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/users (POST)', () => {
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
        id: result.body.id,
        name: 'firstNewUser',
        email: 'firstNewUser@gmail.com',
        role: 'default',
        created_at: result.body.created_at,
        updated_at: result.body.updated_at,
      });
    });

    it('should throw `BadRequestException` when user aready exists', async () => {
      const result = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'firstNewUser',
          email: 'firstNewUser@gmail.com',
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

  afterAll(async () => {
    await app.close();
    await orchestrator.destroy();
  });
});
