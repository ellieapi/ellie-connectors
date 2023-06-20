import pg from 'pg';
export declare function postgresqlConnect(settings: pg.PoolConfig): void;
export declare function postgresqlExport(schemas: Array<string>): Promise<any>;
