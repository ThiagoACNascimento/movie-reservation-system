import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { PostgresStatus } from './interfaces/postgres/postgres.interface';
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  getStatus(): Promise<PostgresStatus> {
    return this.statusService.getPostgresStatus();
  }
}
