import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './modules/status/status.module';
import { PrismaModule } from './infra/database/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CryptModule } from './infra/crypt/Crypt.module';

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
  ],
})
export class AppModule {}
