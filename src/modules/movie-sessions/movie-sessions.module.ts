import { Module } from '@nestjs/common';
import { MovieSessionsService } from './movie-sessions.service';
import { MovieSessionsController } from './movie-sessions.controller';

@Module({
  controllers: [MovieSessionsController],
  providers: [MovieSessionsService],
})
export class MovieSessionsModule {}
