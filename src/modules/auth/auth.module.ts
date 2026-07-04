import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CryptModule } from '../../infra/crypt/Crypt.module';

@Module({
  imports: [UsersModule, CryptModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
