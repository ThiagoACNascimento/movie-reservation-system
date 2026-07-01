import { PrismaService } from '../../infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { PostgresStatus } from './interfaces/postgres/postgres.interface';

@Injectable()
export class StatusService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPostgresStatus(): Promise<PostgresStatus> {
    const updatedAt = new Date().toISOString();

    const postgresVersionResult = await this.prismaService.$queryRaw<
      { server_version: string }[]
    >`SHOW server_version;`;
    const postgresVersion = postgresVersionResult[0].server_version;

    const postgresMaxConnectionsResult = await this.prismaService.$queryRaw<
      { max_connections: string }[]
    >`SHOW max_connections;`;
    const postgresMaxConnections = parseInt(
      postgresMaxConnectionsResult[0].max_connections,
      10,
    );

    const postgresOpenConnectionsResult = await this.prismaService.$queryRaw<
      {
        open_connections: number;
      }[]
    >`
        SELECT count(*)::int AS open_connections
        FROM pg_stat_activity
        WHERE datname = current_database();
      `;
    const postgresOpenConnections =
      postgresOpenConnectionsResult[0].open_connections;

    const result = {
      updated_at: updatedAt,
      status: {
        database: {
          postgres: {
            version: postgresVersion,
            max_connections: postgresMaxConnections,
            open_connections: postgresOpenConnections,
          },
        },
      },
    };

    return result;
  }
}
