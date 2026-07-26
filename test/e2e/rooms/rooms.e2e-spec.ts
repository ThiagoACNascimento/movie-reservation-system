import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { Orchestrator } from '../../orchestrator';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Room } from '../../../src/generated/prisma/client';
import { PaginationResult } from '../../../src/common/interfaces/pagination-result.interface';

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

    describe('should return a BadRequestException error when try create an room with invalid body', () => {
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

  describe('Found (GET)', () => {
    describe('Get one with slug', () => {
      it('should return an Unauthorized error with anonymous user', async () => {
        const result = await request(app.getHttpServer())
          .get('/rooms/room-1')
          .expect(401);

        expect(result.body).toEqual({
          message: 'You are not logging',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should return an Forbidden error with default user', async () => {
        const cookies = await orchestrator.createUserAndLogin(app);
        const result = await request(app.getHttpServer())
          .get('/rooms/room-1')
          .set('Cookie', cookies)
          .expect(403);

        expect(result.body).toEqual({
          message: 'Forbidden resource',
          error: 'Forbidden',
          statusCode: 403,
        });
      });

      it('should return an NotFound error when room-1 not exist', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);
        const result = await request(app.getHttpServer())
          .get('/rooms/room-1')
          .set('Cookie', cookies)
          .expect(404);

        expect(result.body).toEqual({
          message: 'Room not found.',
          error: 'Not Found',
          statusCode: 404,
        });
      });

      it('should return a Room successfuly', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);
        const room = await orchestrator.createRoom();

        const result = (await request(app.getHttpServer())
          .get(`/rooms/${room.slug}`)
          .set('Cookie', cookies)
          .expect(200)) as { body: Room };

        expect(result.body).toEqual({
          id: room.id,
          name: room.name,
          slug: room.slug,
          capacity: room.capacity,
        });
      });
    });

    describe('Get all', () => {
      it('should return an Unauthorized error with anonymous user', async () => {
        const result = await request(app.getHttpServer())
          .get('/rooms')
          .expect(401);

        expect(result.body).toEqual({
          message: 'You are not logging',
          error: 'Unauthorized',
          statusCode: 401,
        });
      });

      it('should return an Forbidden error with default user', async () => {
        const cookies = await orchestrator.createUserAndLogin(app);
        const result = await request(app.getHttpServer())
          .get('/rooms')
          .set('Cookie', cookies)
          .expect(403);

        expect(result.body).toEqual({
          message: 'Forbidden resource',
          error: 'Forbidden',
          statusCode: 403,
        });
      });

      it('should return a Room successfuly with empty array', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);

        const result = (await request(app.getHttpServer())
          .get(`/rooms`)
          .set('Cookie', cookies)
          .expect(200)) as { body: PaginationResult<Room> };

        expect(Array.isArray(result.body.data)).toBeTruthy();
        expect(result.body).toEqual({
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            lastPage: 0,
            prev: null,
            next: null,
          },
        });
      });

      it('should return a Room successfuly with not empty array', async () => {
        const cookies = await orchestrator.createUserAndLogin(app, true);
        await orchestrator.createRoom();
        await orchestrator.createRoom();
        await orchestrator.createRoom();

        const result = (await request(app.getHttpServer())
          .get(`/rooms`)
          .set('Cookie', cookies)
          .expect(200)) as { body: PaginationResult<Room> };

        expect(Array.isArray(result.body.data)).toBeTruthy();
        expect(result.body.data.length).toBeGreaterThan(1);
        expect(result.body.data.length).toBeLessThan(4);
      });
    });
  });
});
