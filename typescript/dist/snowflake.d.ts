interface SnowflakeSettings {
    username: string;
    password: string;
    account: string;
    warehouse: string;
    database: string;
}
export declare function snowflakeConnect(settings: SnowflakeSettings): Promise<void>;
export declare function snowflakeExport(schemas: Array<string>): Promise<{
    model: {
        level: string;
        entities: {
            name: string;
            attributes: any;
        }[];
        relationships: {
            sourceEntity: {
                name: string;
                startType: string;
            };
            targetEntity: {
                name: string;
                endType: string;
            };
        }[];
    };
}>;
export {};
