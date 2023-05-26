import ellie

postgresql_settings = {
    'user': '',
    'password': '',
    'host': '',
    'port': '',
    'database': ''
}

ellie_settings = {
    'organization': '',
    'token': '',
    'api_version': 'v1'
}

ellie.postgresql_connect(postgresql_settings)
data = ellie.postgresql_export(['PUBLIC'])

ellie.ellie_connect(ellie_settings)
response = ellie.ellie_model_import('model name', data)
print(response.text)