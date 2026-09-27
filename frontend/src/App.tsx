import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { AlertsPage } from './pages/AlertsPage';
import { AtmospherePage } from './pages/AtmospherePage';
import { OxygenPage } from './pages/OxygenPage';
import { WaterPage } from './pages/WaterPage';
import { ScrubbersPage } from './pages/ScrubbersPage';
import { ResourceReclamationPage } from './pages/ResourceReclamationPage';
import { ThresholdsPage } from './pages/ThresholdsPage';
import { HabitatZonesPage } from './pages/HabitatZonesPage';
import { InventoryPage } from './pages/InventoryPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ContactsPage } from './pages/ContactsPage';
import { ProductsPage } from './pages/ProductsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { VendorBillsPage } from './pages/VendorBillsPage';
import { SalesOrdersPage } from './pages/SalesOrdersPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { AccountsPage } from './pages/AccountsPage';
import { JournalsPage } from './pages/JournalsPage';
import { JournalEntriesPage } from './pages/JournalEntriesPage';
import { AnalyticAccountsPage } from './pages/AnalyticAccountsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(localStorage.getItem('lunar_token'))
  );
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/') {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  const handleLogout = () => {
    localStorage.removeItem('lunar_token');
    localStorage.removeItem('lunar_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderCurrentPage = () => {
    switch (currentPath) {
      // MISSION
      case '/dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case '/digital-twin':
        return <DigitalTwinPage onNavigate={handleNavigate} />;
      case '/telemetry':
        return <TelemetryPage />;
      case '/alerts':
        return <AlertsPage onNavigate={handleNavigate} />;

      // LIFE SUPPORT
      case '/atmosphere':
        return <AtmospherePage />;
      case '/oxygen':
        return <OxygenPage />;
      case '/water':
        return <WaterPage />;
      case '/reclamation':
      case '/resource-reclamation':
        return <ResourceReclamationPage />;
      case '/scrubbers':
        return <ScrubbersPage />;
      case '/maintenance':
        return <MaintenancePage />;

      // OPERATIONS
      case '/inventory':
        return <InventoryPage />;
      case '/contacts':
        return <ContactsPage />;
      case '/products':
        return <ProductsPage />;
      case '/purchase-orders':
        return <PurchaseOrdersPage />;
      case '/vendor-bills':
        return <VendorBillsPage />;
      case '/sales-orders':
        return <SalesOrdersPage />;
      case '/invoices':
        return <InvoicesPage />;
      case '/payments':
        return <PaymentsPage />;

      // FINANCE
      case '/accounts':
        return <AccountsPage />;
      case '/journals':
        return <JournalsPage />;
      case '/journal-entries':
        return <JournalEntriesPage />;
      case '/analytic-accounts':
        return <AnalyticAccountsPage />;
      case '/budgets':
        return <BudgetsPage />;
      case '/reports':
      case '/reports/balance-sheet':
      case '/reports/profit-loss':
      case '/reports/budget':
      case '/reports/environment':
      case '/reports/resources':
        return <ReportsPage />;

      // SYSTEM
      case '/zones':
      case '/habitat-zones':
      case '/modules':
        return <HabitatZonesPage />;
      case '/thresholds':
        return <ThresholdsPage />;
      case '/audit-logs':
        return <AuditLogsPage />;
      case '/users':
        return <UsersPage />;
      case '/settings':
        return <SettingsPage />;

      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;
