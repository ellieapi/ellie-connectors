
# TypeScript Connector for Ellie.ai API

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

To get started with this TypeScript module, make sure you meet the following requirements. 

When you use `npm` for installation, the dependencies will be automatically installed during the setup process.

- Node: Please ensure you have Node version 16+ installed on your system.
- Dependencies: This module relies on the following packages:
  - Snowflake Connector: `snowflake-sdk`
  - PostgreSQL Connector: `pg`
  - Ellie Connector: `axios`

## Installation

Create a new node project using the following commands:

```bash
mkdir sample
cd sample
npm init -y
touch index.mjs
```

Use the node package manager `npm` to install the `ellie` module from Github:

```bash
npm install -P 'https://gitpkg.now.sh/ellieapi/ellie-connectors/typescript?main'
```

## Usage

This module provides a variety of functions to help you interact with your databases and Ellie.ai. Here is the typical workflow:

1. Initialize the database connector (PostgreSQL or Snowflake) with appropriate settings.
2. Export the metadata from your database.
3. Initialize the Ellie connector with settings.
4. Import the metadata to Ellie.

Below, we present examples for both Snowflake and PostgreSQL connectors. For more detailed documentation of each function, scroll to the [Functions Documentation](#functions-documentation) section.

### Snowflake Example

```TypeScript
import * as ellie from 'ellie'

async function main() {
  // Define your settings for Snowflake and Ellie.ai
    const snowflakeSettings = {
        account: 'insert your account name here',
        username: 'insert your username here',
        password: 'insert your password here',
        warehouse: 'insert your warehouse name here',
        database: 'insert your database name here',
      }
    const ellieSettings = {
      organization: 'organization_slug', // Organization short name "slug", for example in organization url https://company.ellie.ai the "company" is the organization 
      token: 'api_token', // API Token, from Ellie API Settings panel 
      api_version: 'v1', // Ellie API version. Currently only v1 exists.
    }
    // Establish a connection with Snowflake, export data, connect with Ellie.ai, and import data
    ellie.snowflakeConnect(snowflakeSettings)
    const snowflakeData = await ellie.snowflakeExport(['PUBLIC'])
      
    ellie.ellieConnect(ellieSettings)
    const response = await ellie.ellieModelImport('model name' + Date.now(), snowflakeData)
    // Confirm the success of the import operation
    console.log(response.data)
}

main()
```


### PostgreSQL Example

```TypeScript
import * as ellie from 'ellie';

async function main() {
  // Define your settings for PostgreSQL and Ellie.ai
  const postgresqlSettings = {
    user: 'Insert your username here',
    password: 'Insert your password here',
    host: 'Insert the hostname of PostgreSQL here',
    port: 'Insert the PostgreSQL port here. Default: 5432',
    database: 'Insert the database name here',
  }

  const ellieSettings = {
    organization: 'organization_slug', // Organization short name "slug", for example in organization url https://company.ellie.ai the "company" is the organization.
    token: 'api_token', // API Token, from Ellie API Settings panel. 
    api_version: 'v1', // Ellie API version. Currently only v1 exists.
  }

  // Establish a connection with PostgreSQL, export data, connect with Ellie.ai, and import data
  ellie.postgresqlConnect(postgresqlSettings);
  const psqlData = await ellie.postgresqlExport(['public'])
    
  ellie.ellieConnect(ellieSettings)
  const response = await ellie.ellieModelImport('model name' + Date.now(), psqlData)
  console.log(response.data)
}

main()

```

## Functions Documentation

Below is the documentation for the available functions in this module, along with examples for both Snowflake and PostgreSQL connectors.

### Snowflake

```TypeScript
import * as ellie from 'ellie'

/**
 * Connection settings for Snowflake
 * @typedef {Object} SnowflakeSettings
 * @property {string} account - Your account name.
 * @property {string} username - Your username.
 * @property {string} password - Your password.
 * @property {string} warehouse - Your warehouse name.
 * @property {string} database - Your database name.
 */
const snowflakeSettings = {
  account: 'insert your account name here',
  username: 'insert your username here',
  password: 'insert your password here',
  warehouse: 'insert your warehouse name here',
  database: 'insert your database name here',
}

/**
 * Make a new connection to Snowflake. The connection is kept up and commands to Snowflake can be sent.
 *
 * @param {SnowflakeSettings} settings - The settings object containing the connection settings to Snowflake.
 * @returns {void}
 */
ellie.snowflakeConnect(snowflakeSettings)

/**
 * Export schemas containing tables from Snowflake.
 *
 * @param {string[]} [schemas=['PUBLIC']] - Array of schemas to query the database data from. Default is ['PUBLIC'].
 * @returns {Object} Model data in Ellie API.
 */
ellie.snowflakeExport(['PUBLIC', 'SOMETHING_ELSE'])
```

### PostgreSQL 

```TypeScript
import * as ellie from 'ellie';

/**
 * Connection settings for PostgreSQL
 * @typedef {Object} PostgreSqlSettings
 * @property {string} user - Your username.
 * @property {string} password - Your password.
 * @property {string} host - The hostname of PostgreSQL.
 * @property {string} port - The PostgreSQL port (Default is '5432').
 * @property {string} database - Your database name.
 */
const postgresqlSettings = {
  user: 'Insert your username here',
  password: 'Insert your password here',
  host: 'Insert the hostname of PostgreSQL here',
  port: 'Insert the PostgreSQL port here. Default: 5432',
  database: 'Insert the database name here',
}

/**
 * Make a new connection to PostgreSQL. The connection is kept up and commands to PostgreSQL can be sent.
 *
 * @param {postgresqlSettings} postgresqlSettings - The settings object containing the connection settings to PostgreSQL.
 * @returns {void}
 */
ellie.postgresqlConnect(postgresqlSettings)

/**
 * Export schemas containing tables from PostgreSQL.
 *
 * @param {string[]} [schemas=['public']] - Array of schemas to query the database data from. Default is ['public'].
 * @returns {Object} Model data in Ellie model API format.
 */
ellie.postgresqlExport(['public', 'something else'])
```

### Ellie 

```TypeScript

/**
 * Connection settings for Ellie
 * @typedef {Object} EllieSettings
 * @property {string} organization - Organization short name slug (e.g., 'company' in https://company.ellie.ai).
 * @property {string} token - API token from the Ellie API Settings panel.
 * @property {string} api_version - Ellie API version (currently only 'v1' is available).
 */
const ellieSettings = {
  organization: 'organization_slug', 
  token: 'api_token', 
  api_version: 'v1', 
}

/**
 * Make a new connection to Ellie. The connection is kept up and commands can be sent.
 *
 * @param {EllieSettings} ellieSettings - The settings object containing the connection settings to Ellie.
 * @returns {void}
 */
ellie.ellieConnect(ellieSettings)

/**
 * Import a model exported from a database to Ellie.
 *
 * @param {string} modelName - Model name that will be used in Ellie when the new model is created.
 * @param {Object} modelData - Model data for creating the new model, in Ellie model format.
 * @returns {Object} Requests return object.
 */
ellie.ellieModelImport('model name', data)

/**
 * Export a model from Ellie.
 *
 * @param {number} modelId - The ID of the model to be exported.
 * @returns {Object} Model data in Ellie data format.
 */
ellie.ellieModelExport(modelId)
```

Enjoy your seamless integration journey with Ellie.ai!