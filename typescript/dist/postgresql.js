import pg from 'pg';
let postgresqlPool = null;
export function postgresqlConnect(settings) {
    postgresqlPool = new pg.Pool(settings);
}
async function getTableData(schemas) {
    const joinedSchemas = joinSchemas(schemas);
    const client = await postgresqlPool.connect();
    const result = await client.query(`
    SELECT DISTINCT
      t.table_schema,
      t.table_name,
      c.column_name,
      CASE WHEN tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = c.column_name THEN true ELSE false END as is_primary_key,
      kcu.constraint_name as foreign_key_constraint_name,
      ccu.table_schema as foreign_key_table_schema,
      ccu.table_name as foreign_key_table_name
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON c.table_schema = t.table_schema AND c.table_name = t.table_name
    LEFT JOIN information_schema.key_column_usage kcu ON kcu.table_schema = t.table_schema AND kcu.table_name = t.table_name AND kcu.column_name = c.column_name
    LEFT JOIN information_schema.table_constraints tc ON tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name AND tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = kcu.constraint_name
    WHERE t.table_schema IN (${joinedSchemas})
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_schema, t.table_name, c.column_name
  `);
    await client.end();
    return result;
}
export async function postgresqlExport(schemas) {
    const { rows: tableData } = await getTableData(schemas);
    const relationships = [];
    let groupedRows = {};
    let earlierName = '';
    // Group the rows by table name
    for (const row of tableData) {
        const tableSchema = row.table_schema;
        const tableName = row.table_name;
        const columnName = row.column_name;
        const isPrimaryKey = row.is_primary_key;
        const foreignKeyConstraintName = row.foreign_key_constraint_name;
        const foreignKeyTableSchema = row.foreign_key_table_schema;
        const foreignKeyTableName = row.foreign_key_table_name;
        const schemaTableName = `${tableSchema}.${tableName}`;
        const foreignSchemaTableName = `${foreignKeyTableSchema}.${foreignKeyTableName}`;
        if (earlierName !== schemaTableName) {
            console.log('Fetching:', schemaTableName);
            earlierName = schemaTableName;
        }
        if (!(schemaTableName in groupedRows)) {
            groupedRows[schemaTableName] = {
                attributes: {}
            };
        }
        const attribute = {
            name: columnName,
            metadata: {
                PK: isPrimaryKey,
                FK: Boolean(foreignKeyConstraintName && tableName !== foreignKeyTableName)
            }
        };
        if (columnName in groupedRows[schemaTableName].attributes) {
            const attributeOld = groupedRows[schemaTableName].attributes[columnName];
            attribute.metadata.PK = attributeOld.metadata.PK || attribute.metadata.PK;
            attribute.metadata.FK = attributeOld.metadata.FK || attribute.metadata.FK;
        }
        groupedRows[schemaTableName].attributes[columnName] = attribute;
        if (foreignKeyConstraintName && schemaTableName !== foreignSchemaTableName) {
            const relationship = {
                sourceEntity: {
                    name: schemaTableName,
                    startType: 'many'
                },
                targetEntity: {
                    name: foreignSchemaTableName,
                    endType: 'one'
                }
            };
            relationships.push(relationship);
        }
    }
    const entities = Object.keys(groupedRows).map(schemaTableName => ({
        name: schemaTableName,
        attributes: Object.values(groupedRows[schemaTableName].attributes)
    }));
    const model = {
        model: {
            level: 'logical',
            entities,
            relationships
        }
    };
    return model;
}
function joinSchemas(schemas) {
    return schemas.map(k => `'${k}'`).join(', ');
}
