import requests
import json

base_url = "http://localhost:8080/api/v1/lunar"

login_res = requests.post(f"{base_url}/auth/login", json={"username": "admin", "password": "admin123"})
assert login_res.status_code == 200, f"Login failed: {login_res.text}"
token = login_res.json()["token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("="*60)
print("  DATABASE VERIFICATION AUDIT")
print("="*60)

print("\n1. TELEMETRY & ENVIRONMENTAL ALERTS VERIFICATION")
telemetry_res = requests.get(f"{base_url}/telemetry/1", headers=headers)
print(f"  Telemetry Record #1 Fetch: HTTP {telemetry_res.status_code}")
t = telemetry_res.json()
print(f"    Zone: {t.get('habitatZone', {}).get('name')} ({t.get('habitatZone', {}).get('code')})")
print(f"    Pressure: {t.get('atmosphericPressureKpa')} kPa | Water Purity: {t.get('waterPurityPercent')}%")
print(f"    CO2 Level: {t.get('co2LevelPpm')} ppm | Temp: {t.get('temperatureCelsius')} C | Humidity: {t.get('humidityPercent')}%")
print(f"    Status: {t.get('status')} | Source: {t.get('source')}")

alerts_res = requests.get(f"{base_url}/alerts", headers=headers)
alerts = alerts_res.json()
alert_list = alerts.get("content", alerts) if isinstance(alerts, dict) else alerts
print(f"\n  Environmental Alerts Lifecycle:")
for a in alert_list:
    print(f"    Alert #{a['id']}: Status={a['status']} | Type={a.get('alertType')} | Severity={a['severity']}")
    print(f"      Message: {a.get('message')}")
    print(f"      Created At: {a.get('createdAt')} | Ack At: {a.get('acknowledgedAt')} | Resolved At: {a.get('resolvedAt')}")

print("\n2. PROCUREMENT: PURCHASE ORDERS & VENDOR BILLS VERIFICATION")
po_res = requests.get(f"{base_url}/purchase-orders/1", headers=headers)
po = po_res.json()
print(f"  Purchase Order #{po['id']} ({po['poNumber']}): Status={po['status']} | Total={po.get('total')}")
for l in po.get("lines", []):
    print(f"    Line #{l['id']}: Product={l.get('product', {}).get('name')}, Qty={l.get('quantity')}, UnitPrice={l.get('unitPrice')}, LineTotal={l.get('lineTotal')}")

vb_res = requests.get(f"{base_url}/vendor-bills/1", headers=headers)
vb = vb_res.json()
print(f"\n  Vendor Bill #{vb['id']} ({vb['billNumber']}): Status={vb['status']} | Total={vb.get('total')}, Paid={vb.get('paidAmount')}, BalanceDue={vb.get('balanceDue')}")

print("\n3. SALES ORDERS & CUSTOMER INVOICES VERIFICATION")
so_res = requests.get(f"{base_url}/sales-orders/1", headers=headers)
so = so_res.json()
print(f"  Sales Order #{so['id']} ({so['orderNumber']}): Status={so['status']} | Total={so.get('total')}")

inv_res = requests.get(f"{base_url}/invoices/1", headers=headers)
inv = inv_res.json()
print(f"\n  Customer Invoice #{inv['id']} ({inv['invoiceNumber']}): Status={inv['status']} | Total={inv.get('total')}, Paid={inv.get('paidAmount')}, BalanceDue={inv.get('balanceDue')}")
line_sum = 0
for l in inv.get("lines", []):
    lt = float(l.get("lineTotal", 0))
    line_sum += lt
    print(f"    Invoice Line #{l['id']}: Product={l.get('product', {}).get('name')}, Qty={l.get('quantity')}, UnitPrice={l.get('unitPrice')}, LineTotal={lt:.2f}")
inv_total = float(inv.get('total'))
print(f"    Persisted Lines Sum: {line_sum:.2f} | Invoice Total: {inv_total:.2f}")
print(f"    INVOICE TOTAL MATCHES LINE ITEMS: {abs(line_sum - inv_total) < 0.001}")

print("\n4. PAYMENTS & STATUS TRANSITIONS VERIFICATION")
payments_res = requests.get(f"{base_url}/payments", headers=headers)
payments = payments_res.json()
payment_list = payments.get("content", payments) if isinstance(payments, dict) else payments
for p in payment_list:
    print(f"  Payment #{p['id']} ({p['paymentReference']}): Amount={p['amount']} | Method={p['paymentMethod']} | Status={p['status']} | Contact={p.get('contact', {}).get('name')}")
print(f"    Vendor Bill #1 Status after payment: {vb['status']} (Expected: PAID)")
print(f"    Customer Invoice #1 Status after payment: {inv['status']} (Expected: PAID)")

print("\n5. DOUBLE-ENTRY ACCOUNTING & JOURNAL BALANCE VERIFICATION")
journals_res = requests.get(f"{base_url}/journals/entries", headers=headers)
journals = journals_res.json()
journal_list = journals.get("content", journals) if isinstance(journals, dict) else journals
print(f"  Total Journal Entries in Database: {len(journal_list)}")
total_debits = 0
total_credits = 0
all_balanced = True
for j in journal_list:
    debit = float(j.get("totalDebit", 0))
    credit = float(j.get("totalCredit", 0))
    total_debits += debit
    total_credits += credit
    is_bal = abs(debit - credit) < 0.001
    if not is_bal:
        all_balanced = False
    print(f"    Journal #{j['id']} ({j.get('journalNumber')}): Debit={debit:.2f} | Credit={credit:.2f} | Balanced={is_bal} | Ref={j.get('referenceType')}")

print(f"\n  AGGREGATE GENERAL LEDGER AUDIT:")
print(f"    SUM(Total Debit) : {total_debits:.2f}")
print(f"    SUM(Total Credit): {total_credits:.2f}")
print(f"    SUM(debit) == SUM(credit): {abs(total_debits - total_credits) < 0.001}")

print("\n6. BUDGETS & VARIANCE VERIFICATION")
budget_res = requests.get(f"{base_url}/budgets/1", headers=headers)
b = budget_res.json()
print(f"  Budget #{b['id']} (Period: {b.get('period')}): Fiscal Year={b['fiscalYear']}")
print(f"    Analytic Account: {b.get('analyticAccount', {}).get('name')}")
print(f"    Account: {b.get('account', {}).get('accountCode')} - {b.get('account', {}).get('accountName')}")
print(f"    Planned Amount: {b.get('plannedAmount')}")

variance_res = requests.get(f"{base_url}/budgets/analysis?fiscalYear=2026", headers=headers)
v = variance_res.json()
v_list = v.get("items", v) if isinstance(v, dict) else v
print(f"  Budget Variance Line Items: {len(v_list)}")
for item in v_list:
    print(f"    Item: {item.get('accountCode')} | Planned: {item.get('plannedAmount')} | Actual: {item.get('actualAmount')} | Variance: {item.get('variance')}")
print("="*60)
