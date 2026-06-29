export interface PostgresStatus {
  updated_at: string;
  status: {
    database: {
      postgres: {
        version: string;
        max_connections: number;
        open_connections: number;
      };
    };
  };
}
