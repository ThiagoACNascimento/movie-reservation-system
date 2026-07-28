import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { Orchestrator } from '../../orchestrator';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { join } from 'node:path';
import { Movie } from '../../../src/generated/prisma/client';
import { unlink } from 'node:fs/promises';

describe('Movies (E2E', () => {
  let app: INestApplication<App>;
  const orchestrator = new Orchestrator();

  beforeAll(async () => {
    const moduleFixes: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixes.createNestApplication();
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
    it('should return an Unauthorized error for anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .post('/movies')
        .expect(401);

      expect(result.body).toEqual({
        message: 'You are not logging',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should return a Forbidden for default user', async () => {
      const cookies = await orchestrator.createUserAndLogin(app);
      const result = await request(app.getHttpServer())
        .post('/movies')
        .set('Cookie', cookies)
        .expect(403);

      expect(result.body).toEqual({
        message: 'Forbidden resource',
        error: 'Forbidden',
        statusCode: 403,
      });
    });

    it('should return a Forbidden for default user', async () => {
      const cookies = await orchestrator.createUserAndLogin(app, true);
      await orchestrator.createGenre([{ name: 'Action' }, { name: 'Drama' }]);
      const movie = orchestrator.createMovieProps(['Action', 'Drama']);
      const moviePoster = join(
        process.cwd(),
        'movie_images',
        'movie-poster-template-design-21a1c803fe4ff4b858de24f5c91ec57f_screen.jpg',
      );

      const result = (await request(app.getHttpServer())
        .post('/movies')
        .set('Cookie', cookies)
        .field('title', movie.title)
        .field('originalTitle', movie.originalTitle)
        .field('releaseDate', movie.releaseDate.toISOString())
        .field('status', movie.status)
        .field('score', movie.score)
        .field('duration', movie.duration)
        .field('minAge', movie.minAge)
        .field('genres', movie.genres)
        .field('synopsis', movie.synopsis)
        .attach('poster', moviePoster)
        .expect(201)) as { body: Movie };

      expect(result.body).toEqual({
        id: result.body.id,
        title: movie.title,
        originalTitle: movie.originalTitle,
        slug: result.body.slug,
        releaseDate: new Date(movie.releaseDate).toISOString(),
        status: movie.status,
        score: movie.score,
        duration: movie.duration,
        posterUrl: result.body.posterUrl,
        minAge: movie.minAge,
        synopsis: movie.synopsis,
        createdAt: result.body.createdAt,
        updatedAt: result.body.updatedAt,
      });

      await unlink(join(process.cwd(), result.body.posterUrl));
    });
  });
});
