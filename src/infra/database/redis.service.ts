import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    // TODO: use env variables
    super({
      host: 'localhost',
      port: 6379,
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
