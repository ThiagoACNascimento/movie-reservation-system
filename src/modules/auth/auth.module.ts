import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CryptModule } from '../../infra/crypt/Crypt.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { RefreshTokenStorage } from './refresh/refresh-token.storage';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { RolesGuard } from './guards/access-token/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    CryptModule,
  ],
  controllers: [AuthController],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    AuthService,
    RefreshTokenStorage,
  ],
  exports: [JwtModule, ConfigModule],
})
export class AuthModule {}
