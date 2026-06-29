import { Controller, Get } from '@nestjs/common';
import { StatusService } from './status.service';
import { PostgresStatus } from './interfaces/postgres/postgres.interface';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  getStatus(): Promise<PostgresStatus> {
    return this.statusService.getPostgresStatus();
  }
}
