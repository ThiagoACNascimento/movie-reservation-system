import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../../src/app.module';

describe('Status (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/status (GET)', async () => {
    const result = await request(app.getHttpServer())
      .get('/status')
      .expect(200);

    expect(result.body).toEqual({
      updated_at: result.body.updated_at,
      status: {
        database: {
          postgres: {
            version: '16.14',
            max_connections: 100,
            open_connections: 1,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
