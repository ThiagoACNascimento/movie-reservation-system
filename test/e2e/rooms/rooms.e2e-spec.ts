import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { Orchestrator } from '../../orchestrator';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Room } from '../../../src/generated/prisma/client';

describe('Rooms (E2E)', () => {
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
    it('should return an UnauthorizedException error when anonymous user try create a room', async () => {
      const result = await request(app.getHttpServer())
        .post('/rooms')
        .send({
          name: 'Room 1',
          capacity: 30,
        })
        .expect(401);

      expect(result.body).toEqual({
        message: 'You are not logging',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should return an ForbiddenException error when default user try create a room', async () => {
      const cookies = await orchestrator.createUserAndLogin(app);
      const result = await request(app.getHttpServer())
        .post('/rooms')
        .set('Cookie', cookies)
        .send({
          name: 'Room 1',
          capacity: 30,
        })
        .expect(403);

      expect(result.body).toEqual({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    });

    describe('should return a error when try create an room with invalid body', () => {
      it('name', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);
        const result_without_name = await request(app.getHttpServer())
          .post('/rooms')
          .set('Cookie', cookies)
          .send({
            capacity: 30,
          })
          .expect(400);

        expect(result_without_name.body).toEqual({
          message: [
            'name must be shorter than or equal to 10 characters',
            'name must be a string',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });

        const result_large_name = await request(app.getHttpServer())
          .post('/rooms')
          .set('Cookie', cookies)
          .send({
            name: 'large_then_10',
            capacity: 30,
          })
          .expect(400);

        expect(result_large_name.body).toEqual({
          message: ['name must be shorter than or equal to 10 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('capacity', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);
        const result_without_capacity = await request(app.getHttpServer())
          .post('/rooms')
          .set('Cookie', cookies)
          .send({
            name: 'Room 1',
          })
          .expect(400);

        expect(result_without_capacity.body).toEqual({
          message: [
            'capacity must not be greater than 30',
            'capacity must not be less than 10',
            'capacity must be a number conforming to the specified constraints',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });

        const result_greater_capacity = await request(app.getHttpServer())
          .post('/rooms')
          .set('Cookie', cookies)
          .send({
            name: 'Room 1',
            capacity: 31,
          })
          .expect(400);

        expect(result_greater_capacity.body).toEqual({
          message: ['capacity must not be greater than 30'],
          error: 'Bad Request',
          statusCode: 400,
        });

        const result_less_capacity = await request(app.getHttpServer())
          .post('/rooms')
          .set('Cookie', cookies)
          .send({
            name: 'Room 1',
            capacity: 9,
          })
          .expect(400);

        expect(result_less_capacity.body).toEqual({
          message: ['capacity must not be less than 10'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
    });

    it('should return a room successfuly', async () => {
      const cookies = await orchestrator.createUserAndLogin(app, true);
      const result = (await request(app.getHttpServer())
        .post('/rooms')
        .set('Cookie', cookies)
        .send({
          name: 'Room 1',
          capacity: 30,
        })
        .expect(201)) as { body: Room };

      expect(result.body).toEqual({
        id: result.body.id,
        name: 'Room 1',
        slug: 'room-1',
        capacity: 30,
      });
    });
  });
});
