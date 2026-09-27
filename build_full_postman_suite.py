import json
import os

environment = {
    "id": "lunar-habitat-env-id",
    "name": "Lunar Habitat Environment",
    "values": [
        {"key": "baseUrl", "value": "http://localhost:8081", "type": "default", "enabled": True},
        {"key": "token", "value": "", "type": "secret", "enabled": True},
        {"key": "userId", "value": "", "type": "default", "enabled": True},
        {"key": "customerId", "value": "", "type": "default", "enabled": True},
        {"key": "vendorId", "value": "", "type": "default", "enabled": True},
        {"key": "oxygenProductId", "value": "", "type": "default", "enabled": True},
        {"key": "waterProductId", "value": "", "type": "default", "enabled": True},
        {"key": "serviceProductId", "value": "", "type": "default", "enabled": True},
        {"key": "habitatZoneId", "value": "", "type": "default", "enabled": True},
        {"key": "thresholdId", "value": "", "type": "default", "enabled": True},
        {"key": "telemetryId", "value": "", "type": "default", "enabled": True},
        {"key": "alertId", "value": "", "type": "default", "enabled": True},
        {"key": "inventoryId", "value": "", "type": "default", "enabled": True},
        {"key": "maintenanceId", "value": "", "type": "default", "enabled": True},
        {"key": "purchaseOrderId", "value": "", "type": "default", "enabled": True},
        {"key": "vendorBillId", "value": "", "type": "default", "enabled": True},
        {"key": "salesOrderId", "value": "", "type": "default", "enabled": True},
        {"key": "invoiceId", "value": "", "type": "default", "enabled": True},
        {"key": "paymentId", "value": "", "type": "default", "enabled": True},
        {"key": "accountId", "value": "", "type": "default", "enabled": True},
        {"key": "journalEntryId", "value": "", "type": "default", "enabled": True},
        {"key": "analyticAccountId", "value": "", "type": "default", "enabled": True},
        {"key": "budgetId", "value": "", "type": "default", "enabled": True}
    ],
    "_postman_variable_scope": "environment"
}

def make_req(name, method, url_path, query_params=None, body_json=None, test_scripts=None, auth_required=True):
    path_segments = [p for p in url_path.strip("/").split("/") if p]
    
    headers = []
    if auth_required:
        headers.append({"key": "Authorization", "value": "Bearer {{token}}"})
    if body_json is not None:
        headers.append({"key": "Content-Type", "value": "application/json"})
        
    url_obj = {
        "raw": "{{baseUrl}}" + url_path + (("?" + "&".join([f"{k}={v}" for k, v in query_params.items()])) if query_params else ""),
        "host": ["{{baseUrl}}"],
        "path": path_segments
    }
    if query_params:
        url_obj["query"] = [{"key": k, "value": str(v)} for k, v in query_params.items()]
        
    req_obj = {
        "name": name,
        "request": {
            "method": method,
            "header": headers,
            "url": url_obj
        }
    }
    
    if body_json is not None:
        req_obj["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body_json, indent=2)
        }
        
    if test_scripts:
        req_obj["event"] = [
            {
                "listen": "test",
                "script": {
                    "exec": test_scripts,
                    "type": "text/javascript"
                }
            }
        ]
        
    return req_obj

folders = []

# 01 Authentication
folders.append({
    "name": "01 Authentication",
    "item": [
        make_req(
            "Login & Store Token",
            "POST",
            "/api/v1/lunar/auth/login",
            body_json={"username": "admin", "password": "admin123"},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Token returned and extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.token).to.not.be.null;',
                '    pm.expect(jsonData.username).to.eql("admin");',
                '    pm.environment.set("token", jsonData.token);',
                '});'
            ],
            auth_required=False
        ),
        make_req(
            "Get Current User Profile",
            "GET",
            "/api/v1/lunar/auth/me",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Active profile verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.username).to.eql("admin");',
                '    pm.expect(jsonData.roles).to.include("ROLE_ADMIN");',
                '});'
            ]
        )
    ]
})

# 02 Users
folders.append({
    "name": "02 Users",
    "item": [
        make_req(
            "List Users",
            "GET",
            "/api/v1/lunar/users",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Users list is not empty", function () {',
                '    var jsonData = pm.response.json();',
                '    var users = jsonData.content || jsonData;',
                '    pm.expect(users.length).to.be.above(0);',
                '});'
            ]
        ),
        make_req(
            "Create User",
            "POST",
            "/api/v1/lunar/users",
            body_json={
                "username": "astronaut.sarah",
                "password": "Password123!",
                "email": "sarah.chen@lunar.base",
                "fullName": "Commander Sarah Chen",
                "roles": ["HABITAT_OPERATOR"]
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("User created and ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.username).to.eql("astronaut.sarah");',
                '    pm.environment.set("userId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Get User by ID",
            "GET",
            "/api/v1/lunar/users/{{userId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Retrieved user matches created ID", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("userId").toString());',
                '    pm.expect(jsonData.username).to.eql("astronaut.sarah");',
                '});'
            ]
        )
    ]
})

# 03 Contacts
folders.append({
    "name": "03 Contacts",
    "item": [
        make_req(
            "Create Customer Contact",
            "POST",
            "/api/v1/lunar/contacts",
            body_json={
                "code": "CUST-LUNAR-ALPHA",
                "name": "Lunar Surface Expedition Corp",
                "organizationName": "Lunar Surface Expedition Corp",
                "contactType": "CUSTOMER",
                "email": "procurement@lunarexpedition.org",
                "phone": "+1-281-555-0199",
                "address": "Sector 4, Shackleton Rim Facility",
                "status": "ACTIVE"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Customer ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.code).to.eql("CUST-LUNAR-ALPHA");',
                '    pm.environment.set("customerId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Create Vendor Contact",
            "POST",
            "/api/v1/lunar/contacts",
            body_json={
                "code": "VEND-AEROSPACE-SUPPLY",
                "name": "Orbital Reclamation Technologies",
                "organizationName": "Orbital Reclamation Technologies",
                "contactType": "VENDOR",
                "email": "sales@orbitalreclaim.com",
                "phone": "+1-321-555-0144",
                "address": "Launch Complex 39A Orbital Way",
                "status": "ACTIVE"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Vendor ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.code).to.eql("VEND-AEROSPACE-SUPPLY");',
                '    pm.environment.set("vendorId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "List Contacts",
            "GET",
            "/api/v1/lunar/contacts/all",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Contacts list contains entries", function () {',
                '    var jsonData = pm.response.json();',
                '    var contacts = jsonData.content || jsonData;',
                '    pm.expect(contacts.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 04 Products
folders.append({
    "name": "04 Products",
    "item": [
        make_req(
            "Create Reclaimed Oxygen Product",
            "POST",
            "/api/v1/lunar/products",
            body_json={
                "sku": "PROD-O2-REC-E2E",
                "name": "Reclaimed Oxygen Gas (E2E High Purity)",
                "description": "Medical and habitat-grade breathable oxygen",
                "productType": "GOODS",
                "unitOfMeasure": "M3",
                "unitPrice": 4.50,
                "taxRate": 0.0,
                "active": True
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Oxygen Product ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("oxygenProductId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Create Potable Water Product",
            "POST",
            "/api/v1/lunar/products",
            body_json={
                "sku": "PROD-H2O-POT-E2E",
                "name": "Potable Reclaimed Water (E2E Mineralized)",
                "description": "Recycled and mineralized drinking water",
                "productType": "GOODS",
                "unitOfMeasure": "LITER",
                "unitPrice": 2.20,
                "taxRate": 0.0,
                "active": True
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Water Product ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("waterProductId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Create CO2 Scrubber Servicing Product",
            "POST",
            "/api/v1/lunar/products",
            body_json={
                "sku": "PROD-CO2-SCRUB-E2E",
                "name": "CO2 Scrubber Maintenance & Canister Servicing",
                "description": "Chemical canister regeneration and filter replacement",
                "productType": "SERVICE",
                "unitOfMeasure": "HOUR",
                "unitPrice": 500.00,
                "taxRate": 0.0,
                "active": True
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Service Product ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("serviceProductId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "List Products",
            "GET",
            "/api/v1/lunar/products/active",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Active products list is not empty", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 05 Habitat Zones
folders.append({
    "name": "05 Habitat Zones",
    "item": [
        make_req(
            "Create Habitat Dome Alpha",
            "POST",
            "/api/v1/lunar/zones",
            body_json={
                "code": "ZONE-ALPHA-DOME",
                "name": "Habitat Dome Alpha",
                "type": "DOMESTIC",
                "capacity": 24,
                "volumeM3": 12500.0,
                "status": "OPERATIONAL",
                "description": "Primary crew quarters and life support biome"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Habitat Zone ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.code).to.eql("ZONE-ALPHA-DOME");',
                '    pm.environment.set("habitatZoneId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "List Zones",
            "GET",
            "/api/v1/lunar/zones",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Habitat zones list is not empty", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 06 Environmental Thresholds
folders.append({
    "name": "06 Environmental Thresholds",
    "item": [
        make_req(
            "Create Threshold",
            "POST",
            "/api/v1/lunar/thresholds",
            body_json={
                "parameter": "CO2_LEVEL",
                "minimumValue": 0.0,
                "maximumValue": 1000.0,
                "unit": "ppm",
                "severity": "CRITICAL",
                "enabled": True,
                "actionDescription": "Engage secondary CO2 scrubber fan array and trigger alert"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Threshold ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("thresholdId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Update Threshold",
            "PUT",
            "/api/v1/lunar/thresholds/{{thresholdId}}",
            body_json={
                "parameter": "CO2_LEVEL",
                "minimumValue": 0.0,
                "maximumValue": 950.0,
                "unit": "ppm",
                "severity": "CRITICAL",
                "enabled": True,
                "actionDescription": "Engage secondary CO2 amine scrubber and trigger emergency audio beacon"
            },
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Updated threshold maximumValue verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.maximumValue).to.eql(950);',
                '});'
            ]
        ),
        make_req(
            "Get Thresholds",
            "GET",
            "/api/v1/lunar/thresholds",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Thresholds list is not empty", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 07 Telemetry
folders.append({
    "name": "07 Telemetry",
    "item": [
        make_req(
            "POST Real Telemetry",
            "POST",
            "/api/v1/lunar/telemetry",
            body_json={
                "habitatZoneId": "{{habitatZoneId}}",
                "atmosphericPressureKpa": 101.325,
                "waterPurityPercent": 99.4,
                "oxygenConsumptionM3": 14.8,
                "waterConsumptionLiters": 68.5,
                "co2LevelPpm": 1280.0,
                "temperatureCelsius": 22.4,
                "humidityPercent": 48.0,
                "source": "SENSOR"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Telemetry ingested and ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.co2LevelPpm).to.eql(1280);',
                '    pm.environment.set("telemetryId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "GET Telemetry by ID",
            "GET",
            "/api/v1/lunar/telemetry/{{telemetryId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Telemetry record details verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("telemetryId").toString());',
                '    pm.expect(jsonData.habitatZone).to.not.be.null;',
                '});'
            ]
        ),
        make_req(
            "Query Telemetry by Habitat Zone",
            "GET",
            "/api/v1/lunar/telemetry",
            query_params={"zoneId": "{{habitatZoneId}}"},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Telemetry query content contains zone telemetry", function () {',
                '    var jsonData = pm.response.json();',
                '    var items = jsonData.content || jsonData;',
                '    pm.expect(items.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 08 Alerts
folders.append({
    "name": "08 Alerts",
    "item": [
        make_req(
            "Retrieve Generated Alerts",
            "GET",
            "/api/v1/lunar/alerts",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Alerts found and alertId stored", function () {',
                '    var jsonData = pm.response.json();',
                '    var alerts = jsonData.content || jsonData;',
                '    pm.expect(alerts.length).to.be.above(0);',
                '    pm.environment.set("alertId", alerts[0].id);',
                '});'
            ]
        ),
        make_req(
            "Acknowledge Alert",
            "PUT",
            "/api/v1/lunar/alerts/{{alertId}}/acknowledge",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Alert transitioned to ACKNOWLEDGED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("ACKNOWLEDGED");',
                '});'
            ]
        ),
        make_req(
            "Resolve Alert",
            "PUT",
            "/api/v1/lunar/alerts/{{alertId}}/resolve",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Alert transitioned to RESOLVED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("RESOLVED");',
                '});'
            ]
        )
    ]
})

# 09 Inventory
folders.append({
    "name": "09 Inventory",
    "item": [
        make_req(
            "Create Inventory Item",
            "POST",
            "/api/v1/lunar/inventory",
            body_json={
                "resourceName": "Reclaimed Oxygen Tank Reserves",
                "sku": "INV-O2-TANK-E2E",
                "quantity": 1000.0,
                "unitOfMeasure": "M3",
                "location": "Dome Alpha Life-Support Bay 1",
                "minimumStock": 300.0,
                "maximumStock": 5000.0
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Inventory ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("inventoryId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Add Stock to Inventory",
            "PUT",
            "/api/v1/lunar/inventory/{{inventoryId}}/stock",
            body_json={"quantity": 1500.0},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Stock quantity increased", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.quantity).to.eql(1500);',
                '});'
            ]
        ),
        make_req(
            "Remove Stock from Inventory",
            "PUT",
            "/api/v1/lunar/inventory/{{inventoryId}}/stock",
            body_json={"quantity": 1200.0},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Stock quantity reduced", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.quantity).to.eql(1200);',
                '});'
            ]
        ),
        make_req(
            "Query Inventory",
            "GET",
            "/api/v1/lunar/inventory",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Inventory items list returned", function () {',
                '    var jsonData = pm.response.json();',
                '    var items = jsonData.content || jsonData;',
                '    pm.expect(items.length).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 10 Maintenance
folders.append({
    "name": "10 Maintenance",
    "item": [
        make_req(
            "Create Scrubber Maintenance Record",
            "POST",
            "/api/v1/lunar/maintenance",
            body_json={
                "habitatZoneId": "{{habitatZoneId}}",
                "equipmentName": "CO2 Scrubber Primary Loop Alpha",
                "maintenanceType": "PREVENTIVE",
                "scheduledDate": "2026-09-30",
                "cost": 350.00,
                "notes": "Replace amine absorption canisters and recalibrate airflow sensors"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Maintenance ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("maintenanceId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Get Maintenance Records",
            "GET",
            "/api/v1/lunar/maintenance",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Maintenance records retrieved", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        )
    ]
})

# 11 Purchase Orders
folders.append({
    "name": "11 Purchase Orders",
    "item": [
        make_req(
            "Create Purchase Order",
            "POST",
            "/api/v1/lunar/purchase-orders",
            body_json={
                "vendorId": "{{vendorId}}",
                "expectedDate": "2026-10-15",
                "notes": "Emergency procurement of CO2 scrubber servicing and filters",
                "lines": [
                    {
                        "productId": "{{serviceProductId}}",
                        "description": "Quarterly CO2 Scrubber Loop Servicing",
                        "quantity": 1.0,
                        "unitPrice": 500.00,
                        "taxRate": 0.0
                    }
                ]
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Purchase Order created in DRAFT and ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.status).to.eql("DRAFT");',
                '    var total = jsonData.total !== undefined ? jsonData.total : jsonData.totalAmount;',
                '    pm.expect(total).to.eql(500);',
                '    pm.environment.set("purchaseOrderId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Submit Purchase Order",
            "POST",
            "/api/v1/lunar/purchase-orders/{{purchaseOrderId}}/submit",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Purchase Order status is SUBMITTED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("SUBMITTED");',
                '});'
            ]
        ),
        make_req(
            "Approve Purchase Order",
            "POST",
            "/api/v1/lunar/purchase-orders/{{purchaseOrderId}}/approve",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Purchase Order status is APPROVED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("APPROVED");',
                '});'
            ]
        ),
        make_req(
            "Get Purchase Order",
            "GET",
            "/api/v1/lunar/purchase-orders/{{purchaseOrderId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("PO details verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("purchaseOrderId").toString());',
                '    pm.expect(jsonData.status).to.eql("APPROVED");',
                '});'
            ]
        )
    ]
})

# 12 Vendor Bills
folders.append({
    "name": "12 Vendor Bills",
    "item": [
        make_req(
            "Create Vendor Bill from PO",
            "POST",
            "/api/v1/lunar/vendor-bills/from-po/{{purchaseOrderId}}",
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Vendor Bill ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    var total = jsonData.total !== undefined ? jsonData.total : jsonData.totalAmount;',
                '    pm.expect(total).to.eql(500);',
                '    pm.environment.set("vendorBillId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Post Vendor Bill",
            "POST",
            "/api/v1/lunar/vendor-bills/{{vendorBillId}}/post",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Vendor Bill status is POSTED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("POSTED");',
                '});'
            ]
        ),
        make_req(
            "Get Vendor Bill",
            "GET",
            "/api/v1/lunar/vendor-bills/{{vendorBillId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Vendor bill details verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("vendorBillId").toString());',
                '    pm.expect(jsonData.status).to.eql("POSTED");',
                '});'
            ]
        )
    ]
})

# 13 Sales Orders
folders.append({
    "name": "13 Sales Orders",
    "item": [
        make_req(
            "Create Sales Order",
            "POST",
            "/api/v1/lunar/sales-orders",
            body_json={
                "customerId": "{{customerId}}",
                "notes": "Monthly Life Support Resource Supply Contract - Dome Alpha",
                "lines": [
                    {
                        "productId": "{{oxygenProductId}}",
                        "description": "Reclaimed Oxygen Delivery (100 m3)",
                        "quantity": 100.0,
                        "unitPrice": 4.50,
                        "taxRate": 0.0
                    },
                    {
                        "productId": "{{waterProductId}}",
                        "description": "Potable Water Delivery (300 L)",
                        "quantity": 300.0,
                        "unitPrice": 2.20,
                        "taxRate": 0.0
                    }
                ]
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Sales Order created in DRAFT and ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.status).to.eql("DRAFT");',
                '    var total = jsonData.total !== undefined ? jsonData.total : jsonData.totalAmount;',
                '    pm.expect(total).to.eql(1110);',
                '    pm.environment.set("salesOrderId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Confirm Sales Order",
            "POST",
            "/api/v1/lunar/sales-orders/{{salesOrderId}}/confirm",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Sales Order status is CONFIRMED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("CONFIRMED");',
                '});'
            ]
        ),
        make_req(
            "Get Sales Order",
            "GET",
            "/api/v1/lunar/sales-orders/{{salesOrderId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Sales order details verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("salesOrderId").toString());',
                '    pm.expect(jsonData.status).to.eql("CONFIRMED");',
                '});'
            ]
        )
    ]
})

# 14 Customer Invoices
folders.append({
    "name": "14 Customer Invoices",
    "item": [
        make_req(
            "Generate Invoice from Sales Order",
            "POST",
            "/api/v1/lunar/invoices/from-so/{{salesOrderId}}",
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Customer Invoice ID extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    var total = jsonData.total !== undefined ? jsonData.total : jsonData.totalAmount;',
                '    pm.expect(total).to.eql(1110);',
                '    pm.environment.set("invoiceId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Post Invoice to General Ledger",
            "POST",
            "/api/v1/lunar/invoices/{{invoiceId}}/post",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Invoice posted to GL with status POSTED", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("POSTED");',
                '});'
            ]
        ),
        make_req(
            "Get Invoice & Check Total",
            "GET",
            "/api/v1/lunar/invoices/{{invoiceId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Check invoice total matches line sum", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("invoiceId").toString());',
                '    var lineSum = 0;',
                '    jsonData.lines.forEach(function (line) {',
                '        lineSum += (line.lineTotal !== undefined ? line.lineTotal : (line.subtotal || 0));',
                '    });',
                '    var total = jsonData.total !== undefined ? jsonData.total : jsonData.totalAmount;',
                '    pm.expect(total).to.eql(lineSum);',
                '    pm.expect(total).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 15 Payments
folders.append({
    "name": "15 Payments",
    "item": [
        make_req(
            "Vendor Payment",
            "POST",
            "/api/v1/lunar/payments",
            body_json={
                "vendorBillId": "{{vendorBillId}}",
                "contactId": "{{vendorId}}",
                "amount": 500.00,
                "paymentDate": "2026-09-25",
                "paymentMethod": "BANK_TRANSFER",
                "notes": "Full payment for PO scrubber servicing bill"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Vendor payment recorded and ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.amount).to.eql(500);',
                '    pm.environment.set("paymentId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Customer Payment",
            "POST",
            "/api/v1/lunar/payments",
            body_json={
                "invoiceId": "{{invoiceId}}",
                "contactId": "{{customerId}}",
                "amount": 1110.00,
                "paymentDate": "2026-09-25",
                "paymentMethod": "BANK_TRANSFER",
                "notes": "Settlement of monthly resource supply invoice"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Customer payment recorded", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.amount).to.eql(1110);',
                '});'
            ]
        ),
        make_req(
            "Verify Payment Status",
            "GET",
            "/api/v1/lunar/invoices/{{invoiceId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Invoice status transitioned to PAID", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.status).to.eql("PAID");',
                '});'
            ]
        )
    ]
})

# 16 Chart of Accounts
folders.append({
    "name": "16 Chart of Accounts",
    "item": [
        make_req(
            "List Accounts",
            "GET",
            "/api/v1/lunar/accounts",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Chart of accounts is seeded and accountId extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    var accounts = jsonData.content || jsonData;',
                '    pm.expect(accounts.length).to.be.above(0);',
                '    pm.environment.set("accountId", accounts[0].id);',
                '});'
            ]
        ),
        make_req(
            "Get Relevant Accounts",
            "GET",
            "/api/v1/lunar/accounts/type/ASSET",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("All returned accounts are ASSET accounts", function () {',
                '    var jsonData = pm.response.json();',
                '    var accounts = jsonData.content || jsonData;',
                '    pm.expect(accounts.length).to.be.above(0);',
                '    accounts.forEach(function (acc) {',
                '        pm.expect(acc.accountType || acc.type).to.eql("ASSET");',
                '    });',
                '});'
            ]
        )
    ]
})

# 17 Journals
folders.append({
    "name": "17 Journals",
    "item": [
        make_req(
            "Create Manual Journal Entry (Balanced Debits = Credits)",
            "POST",
            "/api/v1/lunar/journals",
            body_json={
                "journalId": 1,
                "reference": "ADJ-2026-001",
                "description": "Monthly depreciation adjustment for habitat dome life support asset",
                "entryDate": "2026-09-25",
                "lines": [
                    {
                        "accountId": 1,
                        "description": "Life Support Equipment Asset Adjustment",
                        "debit": 250.00,
                        "credit": 0.0
                    },
                    {
                        "accountId": 2,
                        "description": "Offsetting Reserve Account",
                        "debit": 0.0,
                        "credit": 250.00
                    }
                ]
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Journal Entry created and ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.environment.set("journalEntryId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Query Journal Entries",
            "GET",
            "/api/v1/lunar/journals/entries",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Journal entries found and journalEntryId extracted", function () {',
                '    var jsonData = pm.response.json();',
                '    var entries = jsonData.content || jsonData;',
                '    pm.expect(entries.length).to.be.above(0);',
                '    pm.environment.set("journalEntryId", entries[0].id);',
                '});'
            ]
        ),
        make_req(
            "Verify Debit and Credit Balance",
            "GET",
            "/api/v1/lunar/journals/entries/{{journalEntryId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Confirm total debit equals total credit", function () {',
                '    var jsonData = pm.response.json();',
                '    var totalDebit = 0;',
                '    var totalCredit = 0;',
                '    jsonData.lines.forEach(function (line) {',
                '        totalDebit += line.debit;',
                '        totalCredit += line.credit;',
                '    });',
                '    pm.expect(totalDebit).to.eql(totalCredit);',
                '    pm.expect(totalDebit).to.be.above(0);',
                '});'
            ]
        )
    ]
})

# 18 Budgets
folders.append({
    "name": "18 Budgets",
    "item": [
        make_req(
            "Create Analytic Account",
            "POST",
            "/api/v1/lunar/budgets/analytic-accounts",
            body_json={
                "code": "CC-DOME-ALPHA",
                "name": "Dome Alpha Operations & Reclamation Center",
                "habitatZoneId": "{{habitatZoneId}}",
                "active": True
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Analytic Account ID stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.code).to.eql("CC-DOME-ALPHA");',
                '    pm.environment.set("analyticAccountId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Create Budget",
            "POST",
            "/api/v1/lunar/budgets",
            body_json={
                "analyticAccountId": "{{analyticAccountId}}",
                "accountId": "{{accountId}}",
                "fiscalYear": 2026,
                "period": "FY2026",
                "plannedAmount": 100000.00,
                "notes": "Annual life support and resource reclamation operating budget"
            },
            test_scripts=[
                'pm.test("Status code is successful", function () {',
                '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
                '});',
                'pm.test("Budget created and budgetId stored", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id).to.not.be.null;',
                '    pm.expect(jsonData.plannedAmount).to.eql(100000);',
                '    pm.environment.set("budgetId", jsonData.id);',
                '});'
            ]
        ),
        make_req(
            "Get Budget by ID",
            "GET",
            "/api/v1/lunar/budgets/{{budgetId}}",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Budget details retrieved", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.id.toString()).to.eql(pm.environment.get("budgetId").toString());',
                '    pm.expect(jsonData.fiscalYear).to.eql(2026);',
                '});'
            ]
        ),
        make_req(
            "Query Budget Variance",
            "GET",
            "/api/v1/lunar/budgets/analysis",
            query_params={"fiscalYear": 2026},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Budget variance report structure verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.items).to.be.an("array");',
                '    pm.expect(jsonData.totalPlanned).to.not.be.null;',
                '    pm.expect(jsonData.totalActual).to.not.be.null;',
                '});'
            ]
        )
    ]
})

# 19 Financial Reports
folders.append({
    "name": "19 Financial Reports",
    "item": [
        make_req(
            "Balance Sheet",
            "GET",
            "/api/v1/lunar/reports/balance-sheet",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Balance Sheet structure and balance verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.totalAssets).to.not.be.null;',
                '    pm.expect(jsonData.totalLiabilities).to.not.be.null;',
                '    pm.expect(jsonData.totalEquity).to.not.be.null;',
                '    pm.expect(jsonData.balanced).to.eql(true);',
                '});'
            ]
        ),
        make_req(
            "Profit & Loss",
            "GET",
            "/api/v1/lunar/reports/profit-loss",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("P&L report structure verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.totalRevenue).to.not.be.null;',
                '    pm.expect(jsonData.totalExpenses).to.not.be.null;',
                '    pm.expect(jsonData.netIncome).to.not.be.null;',
                '});'
            ]
        ),
        make_req(
            "Budget Variance Report",
            "GET",
            "/api/v1/lunar/reports/budget",
            query_params={"fiscalYear": 2026},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Budget report items verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.items).to.be.an("array");',
                '});'
            ]
        ),
        make_req(
            "Accounts Receivable Report",
            "GET",
            "/api/v1/lunar/reports/accounts-receivable",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Accounts Receivable list verified", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        ),
        make_req(
            "Accounts Payable Report",
            "GET",
            "/api/v1/lunar/reports/accounts-payable",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Accounts Payable list verified", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        ),
        make_req(
            "General Ledger Report",
            "GET",
            "/api/v1/lunar/reports/general-ledger",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("General Ledger list verified", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        )
    ]
})

# 20 Environmental Reports
folders.append({
    "name": "20 Environmental Reports",
    "item": [
        make_req(
            "Telemetry Report",
            "GET",
            "/api/v1/lunar/telemetry",
            query_params={"zoneId": "{{habitatZoneId}}"},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Telemetry report contains records", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        ),
        make_req(
            "Resource Consumption Report",
            "GET",
            "/api/v1/lunar/reports/resources",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Resource consumption metrics verified", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.oxygenMetrics).to.not.be.null;',
                '    pm.expect(jsonData.waterMetrics).to.not.be.null;',
                '});'
            ]
        ),
        make_req(
            "Alert Report",
            "GET",
            "/api/v1/lunar/alerts",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Alerts report contains items", function () {',
                '    var jsonData = pm.response.json();',
                '    var alerts = jsonData.content || jsonData;',
                '    pm.expect(alerts).to.be.an("array");',
                '    pm.expect(alerts.length).to.be.above(0);',
                '});'
            ]
        ),
        make_req(
            "Maintenance Report",
            "GET",
            "/api/v1/lunar/maintenance",
            query_params={"zoneId": "{{habitatZoneId}}"},
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Maintenance report contains records", function () {',
                '    var jsonData = pm.response.json();',
                '    var content = jsonData.content || jsonData;',
                '    pm.expect(content).to.be.an("array");',
                '});'
            ]
        ),
        make_req(
            "Environmental Stability Report",
            "GET",
            "/api/v1/lunar/reports/environment",
            test_scripts=[
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Environmental stability KPIs present", function () {',
                '    var jsonData = pm.response.json();',
                '    pm.expect(jsonData.averagePressureKpa).to.not.be.null;',
                '    pm.expect(jsonData.averageWaterPurityPercent).to.not.be.null;',
                '    pm.expect(jsonData.averageCo2LevelPpm).to.not.be.null;',
                '});'
            ]
        )
    ]
})

collection = {
    "info": {
        "name": "Lunar Habitat Environmental Control",
        "description": "Genuine executable end-to-end Postman test suite covering 20 full workflow domains of the Autonomous Lunar Habitat Infrastructure.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": folders
}

os.makedirs("postman", exist_ok=True)

with open("postman/Lunar Habitat Environmental Control.postman_collection.json", "w") as f:
    json.dump(collection, f, indent=2)

with open("postman/Lunar Habitat Environment.postman_environment.json", "w") as f:
    json.dump(environment, f, indent=2)

req_count = sum(len(f["item"]) for f in folders)
test_count = sum(
    sum(len([e for e in r.get("event", []) if e.get("listen") == "test" and e.get("script", {}).get("exec")])
        for r in f["item"]
    ) for f in folders
)

print(f"Generated collection with {len(folders)} folders, {req_count} requests, and {test_count} test suites.")
