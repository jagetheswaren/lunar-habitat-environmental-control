export interface User {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  enabled?: boolean;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  message: string;
}

export interface LunarCoreHealth {
  overallIndex: number;
  status: 'OPTIMAL' | 'NOMINAL' | 'ELEVATED_RISK' | 'CRITICAL';
  atmosphereScore: number;
  waterScore: number;
  lifeSupportScore: number;
  resourcesScore: number;
  maintenanceScore: number;
  powerScore: number;
  activeCriticalAlerts: number;
  activeWarningAlerts: number;
  scrubberStatus: string;
  powerGridStatus: string;
  timestamp?: string;
  operationalInsights: string[];
}

export interface DiagnosticQueryResult {
  query: string;
  answer: string;
  severity: string;
  keyEvidence: string[];
  suggestedActions: string[];
  telemetrySnapshot?: Record<string, any>;
}

export interface HabitatZoneV2 {
  id: number;
  code: string;
  name: string;
  type: string;
  targetCapacity: number;
  isPressurized: boolean;
  isHabitable: boolean;
  status: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  primarySystem: string;
  currentTelemetry?: any;
  activeAlertsCount: number;
}

export interface HabitatZone {
  id: number;
  code: string;
  name: string;
  description?: string;
  targetPressureKpa?: number;
  targetTemperatureC?: number;
  targetHumidityPercent?: number;
  maxCo2Ppm?: number;
  minWaterPurityPercent?: number;
  operationalStatus?: string;
  totalVolumeM3?: number;
  occupancyCount?: number;
}

export interface EnvironmentalThreshold {
  id: number;
  habitatZone?: HabitatZone;
  metricType: string;
  warningLow?: number;
  criticalLow?: number;
  warningHigh?: number;
  criticalHigh?: number;
  unit: string;
  actionProtocol?: string;
  active?: boolean;
}

export interface Telemetry {
  id: number;
  habitatZone: HabitatZone;
  atmosphericPressureKpa: number;
  co2LevelPpm: number;
  waterPurityPercent: number;
  temperatureCelsius: number;
  humidityPercent: number;
  oxygenConsumptionRateLpm?: number;
  waterConsumptionRateLpm?: number;
  status: string;
  source: string;
  recordedAt: string;
}

export interface EnvironmentalAlert {
  id: number;
  habitatZone?: HabitatZone;
  alertType: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  measuredValue?: number;
  thresholdValue?: number;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface InventoryItem {
  id: number;
  product: Product;
  quantityOnHand: number;
  safetyStockLevel: number;
  reorderPoint: number;
  unit: string;
  location: string;
  lastUpdated: string;
}

export interface MaintenanceRecord {
  id: number;
  habitatZone: HabitatZone;
  equipmentName: string;
  taskType: string;
  status: string;
  priority: string;
  technicianNotes?: string;
  scheduledDate: string;
  completedDate?: string;
}

export interface Contact {
  id: number;
  name: string;
  type: 'CUSTOMER' | 'VENDOR' | 'INTERNAL';
  email: string;
  phone?: string;
  address?: string;
  active: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  standardCost: number;
  listPrice: number;
  active: boolean;
}

export interface PurchaseOrderLine {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendor: Contact;
  orderDate: string;
  status: string;
  total: number;
  lines: PurchaseOrderLine[];
}

export interface VendorBillLine {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface VendorBill {
  id: number;
  billNumber: string;
  vendor: Contact;
  billDate: string;
  dueDate: string;
  status: string;
  total: number;
  paidAmount: number;
  balanceDue: number;
  lines: VendorBillLine[];
}

export interface SalesOrderLine {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: number;
  orderNumber: string;
  customer: Contact;
  orderDate: string;
  status: string;
  total: number;
  lines: SalesOrderLine[];
}

export interface InvoiceLine {
  id?: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Contact;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  paidAmount: number;
  balanceDue: number;
  lines: InvoiceLine[];
}

export interface Payment {
  id: number;
  paymentNumber: string;
  contact: Contact;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  type: string;
  referenceNumber?: string;
  status: string;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  active: boolean;
}

export interface Journal {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface JournalEntryLine {
  id?: number;
  account: Account;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  entryDate: string;
  referenceType?: string;
  referenceId?: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  lines: JournalEntryLine[];
}

export interface AnalyticAccount {
  id: number;
  code: string;
  name: string;
  description?: string;
  budgetAllocated?: number;
  totalActualSpend?: number;
}

export interface Budget {
  id: number;
  name: string;
  fiscalYear: number;
  totalPlannedAmount: number;
  totalActualAmount: number;
  status: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entityName: string;
  entityId: string;
  performedBy: string;
  details: string;
  timestamp: string;
}
