import json

folders = [
    '01 Authentication', '02 Users', '03 Contacts', '04 Products', '05 Habitat Zones',
    '06 Environmental Thresholds', '07 Telemetry', '08 Alerts', '09 Inventory',
    '10 Maintenance', '11 Purchase Orders', '12 Vendor Bills', '13 Sales Orders',
    '14 Customer Invoices', '15 Payments', '16 Chart of Accounts', '17 Journals',
    '18 Budgets', '19 Financial Reports', '20 Environmental Reports'
]

collection = {
    'info': {
        'name': 'Lunar Habitat Environmental Control',
        'description': 'Complete API workflow for Autonomous Lunar Habitat',
        'schema': 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    'item': []
}

for folder in folders:
    parts = folder.split(" ", 1)
    if len(parts) > 1:
        path = parts[1].replace(" ", "-").lower()
        title = parts[1]
    else:
        path = folder.lower()
        title = folder

    req = {
        'name': f'GET {title}',
        'event': [
            {
                'listen': 'test',
                'script': {
                    'exec': [
                        'pm.test("Status code is 200", function () {',
                        '    pm.response.to.have.status(200);',
                        '});'
                    ],
                    'type': 'text/javascript'
                }
            }
        ],
        'request': {
            'method': 'GET',
            'header': [{'key': 'Authorization', 'value': 'Bearer {{token}}'}],
            'url': {
                'raw': '{{baseUrl}}/' + path,
                'host': ['{{baseUrl}}'],
                'path': [path]
            }
        }
    }
    
    if folder == '01 Authentication':
        req['request']['method'] = 'POST'
        req['request']['url']['raw'] = '{{baseUrl}}/auth/login'
        req['request']['url']['path'] = ['auth', 'login']
        req['request']['body'] = {
            'mode': 'raw',
            'raw': '{"username":"admin", "password":"password"}'
        }
        req['request']['header'].append({'key': 'Content-Type', 'value': 'application/json'})
        req['event'][0]['script']['exec'].append('var jsonData = pm.response.json();')
        req['event'][0]['script']['exec'].append('if(jsonData.token) { pm.environment.set("token", jsonData.token); }')

    collection['item'].append({
        'name': folder,
        'item': [req]
    })

with open('postman/Lunar Habitat Environmental Control.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)
