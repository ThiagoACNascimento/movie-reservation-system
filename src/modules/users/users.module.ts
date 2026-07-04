import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CryptModule } from '../../infra/crypt/Crypt.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [CryptModule],
})
export class UsersModule {}
