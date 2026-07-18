import { Controller } from '@nestjs/common';
import { MovieSessionsService } from './movie-sessions.service';

@Controller('movie-sessions')
export class MovieSessionsController {
  constructor(private readonly movieSessionsService: MovieSessionsService) {}
}
