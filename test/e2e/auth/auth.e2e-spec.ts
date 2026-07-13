import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { Orchestrator } from '../../orchestrator';
import cookieParser from 'cookie-parser';

describe('Auth (e2e)', () => {
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
        forbidNonWhitelisted: true,
        transform: true,
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

  describe('SignUp (POST)', () => {
    it('should return a new User', async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'firstSignUpUser',
          email: 'firstSignUpUser@gmail.com',
          password: '12345678',
        })
        .expect(201);

      expect(result.body).not.toHaveProperty('password');
      expect(result.body).toEqual({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: result.body.id,
        name: 'firstSignUpUser',
        email: 'firstSignUpUser@gmail.com',
        role: 'default',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        createdAt: result.body.createdAt,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        updatedAt: result.body.updatedAt,
      });
    });

    it('should throw`BadRequestException` when user aready exists', async () => {
      const user = await orchestrator.createUser();
      const result = await request(app.getHttpServer())
        .post('/auth/signup')
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

  describe('SignIn (POST)', () => {
    it('should return cookies with JWT', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: '12345678',
        })
        .expect(200);

      expect(Array.isArray(result.header['set-cookie'])).toBe(true);
      expect(result.header['set-cookie'][0]).toMatch('access_token');
      expect(result.header['set-cookie'][1]).toMatch('refresh_token');
    });

    it('should throw `UnauthorizedException` when user not exist', async () => {
      const user = await orchestrator.createUserWithoutDatabase();
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.data.email,
          password: '12345678',
        })
        .expect(401);

      expect(result.body).toEqual({
        message: 'Email or Password are incorrect, try again.',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should throw `UnauthorizedException` when password is incorrect', async () => {
      const user = await orchestrator.createUser({
        password: 'correctPassword',
      });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'incorrectPassword',
        })
        .expect(401);

      expect(result.body).toEqual({
        message: 'Email or Password are incorrect, try again.',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });
  });

  describe('Refresh (POST)', () => {
    it('should reset `access_token` and `refresh_token`', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: '12345678',
        })
        .expect(200);

      const firstCookies = result.headers['set-cookie'];
      const initialRefreshToken = firstCookies[1];

      const refresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', firstCookies)
        .expect(200);

      const secondCookies = refresh.headers['set-cookie'];
      const secondRefreshToken = secondCookies[1];

      expect(initialRefreshToken !== secondRefreshToken).toBe(true);
    });

    it('should throw `UnauthorizedException` when user is not found', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: '12345678',
        })
        .expect(200);

      const firstCookies = result.headers['set-cookie'];

      await orchestrator.deleteUser(user.id);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', firstCookies)
        .expect(401);

      // TODO: add some message when throw an error
    });

    it('should throw `InvalidRefreshTokenError` when `storedId` is not equal than `tokenHash`', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: '12345678',
        })
        .expect(200);

      const firstCookies = result.headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', firstCookies)
        .expect(200);

      const requestWithError = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', firstCookies)
        .expect(401);

      expect(requestWithError.body).toEqual({
        message: 'Access denied',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });
  });

  describe('Logout (POST)', () => {
    it('should remove `access_token` and `refresh_token`', async () => {
      const user = await orchestrator.createUser({ password: '12345678' });
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: '12345678',
        })
        .expect(200);

      const logoutResult = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', result.headers['set-cookie'])
        .expect(204);

      expect(logoutResult.headers).not.toHaveProperty('set-cookie');
    });
  });
});
