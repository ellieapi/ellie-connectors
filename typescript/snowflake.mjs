import * as ellie from 'ellie'

async function main() {
    const snowflakeSettings = {
        account: '',
        username: '',
        password: '',
        warehouse: '',
        database: '',
      }
    const ellieSettings = {
        organization: '',
        token: '',
        api_version: 'v1',
    }
    ellie.snowflakeConnect(snowflakeSettings)
    const snowflakeData = await ellie.snowflakeExport(['PUBLIC'])
      
    ellie.ellieConnect(ellieSettings)
    const response = await ellie.ellieModelImport('model name' + Date.now(), snowflakeData)
    console.log(response.data)
}

main()