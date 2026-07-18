import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './modules/status/status.module';
import { DatabaseModule } from './infra/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { CryptModule } from './infra/crypt/Crypt.module';
import { AuthModule } from './modules/auth/auth.module';
import { MoviesModule } from './modules/movies/movies.module';
import { GendersModule } from './modules/genders/genders.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { MovieSessionsModule } from './modules/movie-sessions/movie-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
      expandVariables: true,
    }),
    StatusModule,
    DatabaseModule,
    UsersModule,
    CryptModule,
    AuthModule,
    MoviesModule,
    GendersModule,
    RoomsModule,
    MovieSessionsModule,
  ],
})
export class AppModule {}
