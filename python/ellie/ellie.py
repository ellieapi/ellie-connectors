import requests

### ELLIE

ellie_settings = None

"""
Make a new connection to Ellie. The connection is kept up and commands to PostgreSQL can be sent.

Parameters:
    ellie_settings (dict): Ellie settings 
Returns:
    None
"""
def ellie_connect(settings):
    global ellie_settings
    
    if 'api_version' not in settings: 
        settings['api_version'] = 'v1'
    
    ellie_settings = settings

"""
Import a model exported from a database to ellie 

Parameters:
    model_name (str): Model name that will be used in ellie when the new model is created.
    model_data (dict): Model data for creating the new model, in ellie model format

Returns:
    requests(requests): requests return object 
"""
def ellie_model_import(name, model):
    model['model']['name'] = name
    url = f'''https://{ellie_settings['organization']}.ellie.ai/api/{ellie_settings['api_version']}/models?token={ellie_settings['token']}'''
    return requests.post(url=url, json=model)

"""
Export a model from Ellie 

Parameters:
    model_id (int): 
    
Returns:
    Model data in Ellie data format (dict)
"""
def ellie_model_export(model_id):
    url = f'''https://{ellie_settings['organization']}.ellie.ai/api/{ellie_settings['api_version']}/models/{model_id}?token={ellie_settings['token']}'''
    return requests.get(url=url).json()
