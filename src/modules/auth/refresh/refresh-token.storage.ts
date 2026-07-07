import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infra/database/redis.service';
import { createHash } from 'crypto';

@Injectable()
export class RefreshTokenStorage {
  constructor(private readonly redisService: RedisService) {}

  async create(userId: string, tokenId: string): Promise<void> {
    const tokenHash = this.hashToken(tokenId);
    await this.redisService.set(this.getKey(userId), tokenHash);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const tokenHash = this.hashToken(tokenId);
    const storedId = await this.redisService.get(this.getKey(userId));
    return storedId === tokenHash;
  }

  async invalidate(userId: string): Promise<void> {
    await this.redisService.del(this.getKey(userId));
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }

  private hashToken(tokenId: string): string {
    return createHash('sha256').update(tokenId).digest('hex');
  }
}
