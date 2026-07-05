import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './modules/status/status.module';
import { PrismaModule } from './infra/database/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CryptModule } from './infra/crypt/Crypt.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/guards/access-token/access-token.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
      expandVariables: true,
    }),
    StatusModule,
    PrismaModule,
    UsersModule,
    CryptModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class AppModule {}
