import * as ellie from 'ellie'

async function main() {
    const postgresqlSettings = {
        user: '',
        password: '',
        port: 5432,
        database: '',
    }
    const ellieSettings = {
        organization: '',
        token: '',
        api_version: 'v1',
    }
    ellie.postgresqlConnect(postgresqlSettings);
    const psqlData = await ellie.postgresqlExport(['public'])
      
    ellie.ellieConnect(ellieSettings)
    const response = await ellie.ellieModelImport('model name' + Date.now(), psqlData)
    console.log(response.data)
}

main()