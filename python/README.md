
# Python Connector for Ellie.ai API

This guide will walk you through the setup, installation, and usage of connectors for different databases, including Snowflake and PostgreSQL. With these examples, you can extract metadata from your databases and import them into Ellie.ai as new logical models.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Snowflake Example](#snowflake-example)
- [PostgreSQL Example](#postgresql-example)
- [Functions Documentation](#functions-documentation)
  - [Snowflake](#snowflake)
  - [PostgreSQL](#postgresql)
  - [Ellie](#ellie)

For a detailed understanding of Ellie.ai API, refer to the [Full Ellie API Specification](https://ellie.api.ellie.ai/api/docs).

## Requirements

To get started with this Python module, make sure you meet the following requirements. 

If you are using pip for installation, the dependencies will be automatically installed during the setup process.

- Python: Please ensure you have Python version 3.x installed on your system.
- Dependencies: This module relies on the following packages:
  - Snowflake Connector: snowflake-connector-python
  - PostgreSQL Connector: psycopg2
  - Ellie Connector: requests

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install the `ellie` module from Github:

```bash
pip install 'git+https://github.com/jahva/ellietest#subdirectory=python"
```

If you are using Jupyter notebooks or JupyterHub, you should run: 

```bash
!pip install "git+https://github.com/jahva/ellietest#subdirectory=python"
```

## Usage

This module provides a variety of functions to help you interact with your databases and Ellie.ai. Here is the typical workflow:

1. Initialize the database connector (PostgreSQL or Snowflake) with appropriate settings.
2. Export the metadata from your database.
3. Initialize the Ellie connector with settings.
4. Import the metadata to Ellie.

Below, we present examples for both Snowflake and PostgreSQL connectors. For more detailed documentation of each function, scroll to the [Functions Documentation](#functions-documentation) section.

### Snowflake Example

```Python
import ellie

# Define your settings for Snowflake and Ellie.ai
snowflake_settings = {
    'account': 'insert your account name here',
    'user': 'insert your username here',
    'password': 'insert your password here',
    'warehouse': 'insert your warehouse name here',
    'database': 'insert your database name here'
}

ellie_settings = {
    
    'organization': 'organization_slug',  # Organization short name "slug", for example in organization url https://company.ellie.ai the "company" is the organization 
    'token': 'api_token',                 # API Token, from Ellie API Settings panel      
    'api_version': 'v1'                   # Ellie API version. Currently only v1 exists.
}

# Establish a connection with Snowflake, export data, connect with Ellie.ai, and import data
ellie.snowflake_connect(snowflake_settings)
data = ellie.snowflake_export(['PUBLIC'])

ellie.ellie_connect(ellie_settings)
response = ellie.ellie_model_import('model_name', data)

# Confirm the success of the import operation
print(response.text)
```


### PostgreSQL Example

```Python
import ellie

# Define your settings for PostgreSQL and Ellie.ai
postgresql_settings = {
    'user': 'Insert your username here',
    'password': 'Insert your password here',
    'host': 'Insert the hostname of PostgreSQL here',
    'port': 'Insert the PostgreSQL port here. Default: 5432',
    'database': 'Insert the database name here'
}

ellie_settings = {
    'organization': 'organization_slug',  # Organization short name "slug", for example in organization url https://company.ellie.ai the "company" is the organization 
    'token': 'api_token',                 # API Token, from Ellie API Settings panel      
    'api_version': 'v1'                   # Ellie API version. Currently only v1 exists.
}

# Establish a connection with PostgreSQL, export data, connect with Ellie.ai, and import data
ellie.postgresql_connect(postgresql_settings)
data = ellie.postgresql_export(['PUBLIC'])

ellie.ellie_connect(ellie_settings)
response = ellie.ellie_model_import('model_name', data)

# Confirm the success of the import operation
print(response.text)
```
## Functions Documentation

Below is the documentation for the available functions in this module, along with examples for both Snowflake and PostgreSQL connectors.

### Snowflake

```python
import ellie

# settings dictionary, containing the connection settings to Snowflake.
snowflake_settings = {
    'account': '',
    'user': '',
    'password':'',
    'warehouse': '',
    'database': ''
}
"""
Make a new connection to snowflake. The connection is kept up and commands to Snowflake can be sent.

Returns:
    None
"""
ellie.snowflake_connect(snowflake_settings)

"""
Export schemas containing tables from Snowflake.
    Parameters: 
        schemas(list):, list of schemas to query the database data from. Default: ['PUBLIC']
Returns:
    Model data in Ellie API 
"""
ellie.snowflake_export(['PUBLIC', 'SOMETHING_ELSE'])
```

### PostgreSQL 

```python
import ellie

postgresql_settings = {
    'user': '',
    'password': '',
    'host': '',
    'port': '',
    'database': ''
}
""" 
Make a new connection to PostgreSQL. The connection is kept up and commands to postgresql can be sent.
Returns:
    None
"""
ellie.postgresql_connect(postgresql_settings)

"""
Export schemas containing tables from postgresql
Parameters: 
    schemas(list): List of schemas to query the database data from. Default: ['public']

Returns: 
    Model data in ellie model api format (dict)
"""
ellie.postgresql_export(['public', 'something else'])
```

### Ellie 

```Python
import ellie

ellie_settings = {
    'organization': '',     # Organization short name "slug", for example in organization url https://football.ellie.ai the "football" is the organization
    'token': '',            # API Token, from Ellie API Settings panel
    'api_version': 'v1'     # Ellie API version. Currently only v1 exists.
}

"""
Make a new connection to Ellie. The connection is kept up and commands to PostgreSQL can be sent.

Parameters:
    ellie_settings (dict): Ellie settings 
Returns:
    None
"""
ellie.ellie_connect(ellie_settings)

"""
Import a model exported from a database to ellie 

Parameters:
    model_name (str): Model name that will be used in ellie when the new model is created.
    model_data (dict): Model data for creating the new model, in ellie model format

Returns:
    requests(requests): requests return object 
"""
ellie.ellie_model_import('model name', data)


"""
Export a model from Ellie 

Parameters:
    model_id (int): 
    
Returns:
    Model data in Ellie data format (dict)
"""
ellie.ellie_model_export(model_id):
```

Enjoy your seamless integration journey with Ellie.ai!