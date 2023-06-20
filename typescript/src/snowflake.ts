import snowflake from 'snowflake-sdk'

interface SnowflakeSettings {
    username: string
    password: string
    account: string
    warehouse: string
    database: string
}

interface SnowflakeTables {
    TABLE_SCHEMA: string,
    TABLE_NAME: string
}

interface SnowflakeTableData {
    TABLE_SCHEMA: string | null,
    TABLE_NAME: string | null,
    COLUMN_NAME: string | null,
    PK: boolean,
    FK: boolean,
    pk_schema_name: string | null,
    pk_table_name: string | null,
}

let snowflakeConn: any = null;

/**
 * Make a new connection to Snowflake. The connection is kept up and commands to Snowflake can be sent.
 *
 * @param {SnowflakeSettings} settings - The settings object containing the connection settings to Snowflake.
 * @returns {void}
 */
export async function snowflakeConnect(settings: SnowflakeSettings) {
    snowflakeConn = snowflake.createConnection({
        ...settings, 
        schema: 'INFORMATION_SCHEMA',
    })
    await snowflakeConn.connect()
}

/**
 * Export schemas containing tables from Snowflake.
 *
 * @param {string[]} [schemas=['PUBLIC']] - Array of schemas to query the database data from. Default is ['PUBLIC'].
 * @returns {Object} Model data in Ellie API.
 */
export async function snowflakeExport(schemas: Array<string>) {
    let groupedRows: { [key: string]: any } = {}
    let relationships = []

    // Retrieve the list of tables in the schema
    let tables: SnowflakeTables[] = []
    tables = await queryTables(schemas, tables)
    for (const table of tables) {
        const schemaName = table.TABLE_SCHEMA
        const tableName = table.TABLE_NAME
        const schemaTableName = `${schemaName}.${tableName}`
        
        console.log("Fetching:", schemaTableName)
        const tableData = await queryTableData(schemaName, tableName)
        for (const row of tableData) {
            const attribute = {
                name: row.COLUMN_NAME,
                metadata: {
                    PK: row.PK,
                    FK: row.FK
                }
            }
        
            if (!groupedRows[schemaTableName]) {
                groupedRows[schemaTableName] = {attributes: []}
            }
        
            groupedRows[schemaTableName].attributes.push(attribute)
        
            // If there is a foreign key, we create a relationship
            if (row.FK) {
                const relationship = {
                    sourceEntity: {
                        name: schemaTableName,
                        startType: "one"
                    },
                    targetEntity: {
                        name: `${row.pk_schema_name}.${row.pk_table_name}`,
                        endType: "many"
                    }
                }
                relationships.push(relationship)
            }
        }

    }

    // Create an entity for each table
    const entities = Object.keys(groupedRows).map(name => ({
        name: name,
        attributes: groupedRows[name].attributes
    }))

    // Generate the JSON schema
    const model = {
        model: {
            level: "logical",
            entities,
            relationships
        }
    }
    await snowflakeConn.destroy()
    return model
}

async function queryTables(schemas: string[], tables: SnowflakeTables[]): Promise<any> {
    const joinedSchemas: string = schemas.map(k => `'${k}'`).join(', ')
    return new Promise(async (resolve, reject) => {
        await snowflakeConn.execute({
            sqlText: `SELECT TABLE_SCHEMA, TABLE_NAME
                        FROM TABLES 
                        WHERE TABLE_SCHEMA IN (${joinedSchemas})
                        ORDER BY TABLE_NAME; `,
            complete: (err: unknown, stmt: unknown, rows: SnowflakeTables[]) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve(rows)
                }
            }
        })
    }) 
}

async function queryTableData(schemaName: string, tableName: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        await snowflakeConn.execute({
            sqlText: `
            SHOW IMPORTED KEYS IN ${schemaName}.${tableName};
            SHOW PRIMARY KEYS IN ${schemaName}.${tableName};
            SELECT c.TABLE_SCHEMA,
                    c.TABLE_NAME,
                    c.COLUMN_NAME,
                    CASE
                        WHEN pks."column_name" IS NOT NULL THEN true
                        ELSE false
                    END AS PK,
                    CASE
                        WHEN fks."fk_column_name" IS NOT NULL THEN true
                        ELSE false
                    END AS FK,
                    fks."pk_schema_name",
                    fks."pk_table_name"
                FROM COLUMNS c
                    LEFT JOIN table(result_scan(LAST_QUERY_ID(-1))) pks ON c.table_schema = pks."schema_name"
                    AND c.table_name = pks."table_name"
                    AND c.column_name = pks."column_name"
                    LEFT JOIN table(result_scan(LAST_QUERY_ID(-2))) fks ON c.table_schema = fks."fk_schema_name"
                    AND c.table_name = fks."fk_table_name"
                    AND c.column_name = fks."fk_column_name"
                WHERE c.TABLE_SCHEMA = '${schemaName}'
                    AND c.TABLE_NAME = '${tableName}'
                ORDER BY c.ORDINAL_POSITION;`,
            parameters: { MULTI_STATEMENT_COUNT: 3 },
            complete: (err: unknown, stmt: any, rows: SnowflakeTableData[]) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    if(stmt.hasNext())
                    {
                    stmt.NextResult();
                    } else {
                        resolve(rows)
                    } 
                }
            }
        })
    })
}