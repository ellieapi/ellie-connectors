import psycopg2

### POSTGRESQL

postgresql_connection = None

""" 
Make a new connection to PostgreSQL. The connection is kept up and commands to postgresql can be sent.
Returns:
    None
"""
def postgresql_connect(settings): 
    global postgresql_connection
    
    postgresql_connection = psycopg2.connect(
        user=settings['user'],
        password=settings['password'],
        host=settings['host'],
        port=settings['port'],
        database=settings['database'],
    )

"""
Export schemas containing tables from postgresql
Parameters: 
    schemas(list): List of schemas to query the database data from. Default: ['public']

Returns: 
    Model data in ellie model api format (dict)
"""
def postgresql_export(schemas):
    
    rows = _get_table_rows(schemas)
    relationships = []
    grouped_rows = {}

    earlier_name = ''
    # Group the rows by table name
    for row in rows:
        table_schema = row[0]
        table_name = row[1]
        column_name = row[2]
        is_primary_key = row[3]
        foreign_key_constraint_name = row[4]
        foreign_key_table_schema = row[5]
        foreign_key_table_name = row[6]

        schema_table_name = f'{table_schema}.{table_name}'
        foreign_schema_table_name = f'{foreign_key_table_schema}.{foreign_key_table_name}'
        
        if earlier_name != schema_table_name:
            print("Fetching:", schema_table_name)
            earlier_name = schema_table_name

        if schema_table_name not in grouped_rows:
            grouped_rows[schema_table_name] = {
                'attributes': {}
            }
        
        attribute = {
            'name': column_name,
            'metadata': {
                'PK': is_primary_key,
                'FK': bool(foreign_key_constraint_name and table_name != foreign_key_table_name)
            }
        }
        
        # remove duplicates, and set the primary keys right
        if column_name in grouped_rows[schema_table_name]['attributes']:
            attribute_old = grouped_rows[schema_table_name]['attributes'][column_name]
            attribute['metadata']['PK'] = (attribute_old['metadata']['PK'] or attribute['metadata']['PK'])
            attribute['metadata']['FK'] = (attribute_old['metadata']['FK'] or attribute['metadata']['FK'])
            
        grouped_rows[schema_table_name]['attributes'][column_name] = attribute


        # Add foreign key constraint to relationship
        if foreign_key_constraint_name and schema_table_name != foreign_schema_table_name:
            relationship = {
                'sourceEntity': {
                    'name': schema_table_name,
                    'startType': 'many'
                },
                'targetEntity': {
                    'name': foreign_schema_table_name,
                    'endType': 'one'
                }
            }
            relationships.append(relationship)


    # Create an entity for each table
    entities = [
        {
            'name': schema_table_name,
            'attributes': list(grouped_rows[schema_table_name]['attributes'].values())
        }
        for schema_table_name in grouped_rows
    ]
        
    # Generate the JSON schema
    model = {
        "model": {
            "level": "logical",
            "entities": entities,
            "relationships": relationships
        }
    }

    return model


def _get_table_rows(schemas):
    global postgresql_connection
    
    joined_schemas = _join_schemas(schemas)
    
    cursor = postgresql_connection.cursor()

    cursor.execute(f'''
        SELECT DISTINCT t.table_schema,
            t.table_name,
            c.column_name,
            CASE
                WHEN tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = c.column_name THEN true
                ELSE false
            END as is_primary_key,
            kcu.constraint_name as foreign_key_constraint_name,
            ccu.table_schema as foreign_key_table_schema,
            ccu.table_name as foreign_key_table_name
        FROM information_schema.tables t
            LEFT JOIN information_schema.columns c ON c.table_schema = t.table_schema
            AND c.table_name = t.table_name
            LEFT JOIN information_schema.key_column_usage kcu ON kcu.table_schema = t.table_schema
            AND kcu.table_name = t.table_name
            AND kcu.column_name = c.column_name
            LEFT JOIN information_schema.table_constraints tc ON tc.table_schema = kcu.table_schema
            AND tc.table_name = kcu.table_name
            AND tc.constraint_name = kcu.constraint_name
            LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = kcu.constraint_name
        WHERE t.table_schema IN ({joined_schemas})
            AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_schema,
            t.table_name,
            c.column_name;
    ''')
    
    return cursor.fetchall()

def _join_schemas(schemas):
    return ', '.join(f"'{k}'" for k in schemas)
