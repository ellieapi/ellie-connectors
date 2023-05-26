import snowflake.connector

### SNOWFLAKE
snowflake_connection = None

"""
Make a new connection to snowflake. The connection is kept up and commands to Snowflake can be sent.

Returns:
    None
"""
def snowflake_connect(settings):
    global snowflake_connection
    
    snowflake_connection = snowflake.connector.connect(
        user=settings['user'],
        password=settings['password'],
        account=settings['account'],
        warehouse=settings['warehouse'],
        database=settings['database'],
        schema="INFORMATION_SCHEMA"
    )
    
"""
Export schemas containing tables from Snowflake.
    Parameters: 
        schemas(list):, list of schemas to query the database data from. Default: ['PUBLIC']
Returns:
    Model data in Ellie API 
"""
def snowflake_export(schemas = ['PUBLIC']):

    # Retrieve the list of tables in the schemas
    tables = _query_tables(schemas)

    grouped_rows = {}
    relationships = []
    
    for table in tables:
        schema_name = table[0]
        table_name = table[1]
        schema_table_name = f'{schema_name}.{table_name}'
        
        print("Fetching:", schema_table_name)
        
        table_data = _query_table_data(schema_name, table_name)
        
        for row in table_data:
            attribute = {
                "name": row[2],
                "metadata": {
                    "PK": row[3],
                    "FK": row[4]
                }
            }
        
            if schema_table_name not in grouped_rows:
                grouped_rows[schema_table_name] = {"attributes": []}
        
            grouped_rows[schema_table_name]["attributes"].append(attribute)
            
            if row[4]:
                relationship = {
                    "sourceEntity": {
                        "name": f'''{row[0]}.{row[1]}''',
                        "startType": "one"
                    },
                    "targetEntity": {
                        "name": f'''{row[5]}.{row[6]}''',
                        "endType": "many"
                    }
                }
                relationships.append(relationship)

    # Create an entity for each table
    entities = [{
        "name": name,
        "attributes": grouped_rows[name]["attributes"]
    } for name in grouped_rows.keys()]

    # Generate the JSON schema
    model = {
        "model": {
            "level": "logical",
            "entities": entities,
            "relationships": relationships
        }
    }
    return model

def _query_tables(schemas):
    global snowflake_connection
    
    joined_schemas = _join_schemas(schemas)

    with snowflake_connection.cursor() as cur:
        cur.execute(f'''
            SELECT TABLE_SCHEMA,
                TABLE_NAME
            FROM TABLES
            WHERE TABLE_SCHEMA IN ({joined_schemas})
            ORDER BY TABLE_NAME;
        ''')
        tables = cur.fetchall()
    return tables 


def _query_table_data(schema_name, table_name):

    with snowflake_connection.cursor() as cur:
        # Select the foreign keys
        cur.execute(f''' SHOW IMPORTED KEYS IN {schema_name}.{table_name}; ''')
        
        # Select the primary keys 
        cur.execute(f''' SHOW PRIMARY KEYS IN {schema_name}.{table_name};''')

        # Select the full table metadata containing relations
        cur.execute(f'''
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
            WHERE c.TABLE_SCHEMA = '{schema_name}'
                AND c.TABLE_NAME = '{table_name}'
            ORDER BY c.ORDINAL_POSITION;
        ''')        

        table_data = cur.fetchall()
    return table_data


def _join_schemas(schemas):
    return ', '.join(f"'{k}'" for k in schemas)
