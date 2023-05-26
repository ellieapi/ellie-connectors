import ellie

snowflake_settings = {
    'account': '',      
    'user': '',
    'password':'',
    'warehouse': '',
    'database': ''
}

ellie_settings = {
    'organization': '',
    'token': '',
    'api_version': 'v1'
}


ellie.snowflake_connect(snowflake_settings)
data = ellie.snowflake_export(['PUBLIC'])

ellie.ellie_connect(ellie_settings)
response = ellie.ellie_model_import('model name', data)
print(response.text)