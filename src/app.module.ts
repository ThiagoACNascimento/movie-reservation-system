import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
      expandVariables: true,
    }),
    StatusModule,
  ],
})
export class AppModule {}
