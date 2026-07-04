import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptService extends HashingService {
  hash(data: string | Buffer): Promise<string> {
    const spins = process.env.NODE_ENV === 'test' ? 1 : 14;
    return bcrypt.hash(data, spins);
  }
  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
