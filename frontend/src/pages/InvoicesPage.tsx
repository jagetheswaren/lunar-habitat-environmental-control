import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { FileCheck, RefreshCw, Printer, Download, CreditCard, ShieldCheck } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [data, setData] = useState<T.Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<T.Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      const records = await api.invoices.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns: Column<T.Invoice>[] = [
    {
      header: 'INVOICE NUMBER',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.invoiceNumber}
        </span>
      ),
      accessorKey: 'invoiceNumber',
    },
    {
      header: 'TENANT / CUSTOMER',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.customer?.name || 'Axiom Lunar Research Consortium'}
        </span>
      ),
    },
    {
      header: 'ISSUE DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.invoiceDate || '2026-09-20'}
        </span>
      ),
      accessorKey: 'invoiceDate',
    },
    {
      header: 'DUE DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.dueDate || '2026-10-20'}
        </span>
      ),
      accessorKey: 'dueDate',
    },
    {
      header: 'TOTAL',
      render: r => (
        <span className="font-bold text-[#F1F4F6] tabular-nums">
          ₹{Number(r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'total',
    },
    {
      header: 'PAID',
      render: r => (
        <span className="font-bold text-[#10B981] tabular-nums">
          ₹{Number(r.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'paidAmount',
    },
    {
      header: 'OUTSTANDING',
      render: r => {
        const bal = Number(r.balanceDue || 0);
        return (
          <span className={`font-bold tabular-nums ${bal > 0 ? 'text-[#F59E0B]' : 'text-[#657184]'}`}>
            ₹{bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
      align: 'right',
      accessorKey: 'balanceDue',
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'POSTED'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="TENANT COMMERCIAL INVOICES"
        subtitle="ACCOUNTS RECEIVABLE // METERED LIFE-SUPPORT CONSUMPTION & HABITAT LEASE BILLING"
        icon={FileCheck}
        badge="ACCOUNTS RECEIVABLE"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchInvoices();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="NO COMMERCIAL INVOICES FOUND"
        searchable
        searchPlaceholder="SEARCH INVOICES (NUMBER, TENANT, STATUS)..."
        onRowClick={row => {
          setSelectedInvoice(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedInvoice?.id}
        pageSize={25}
      />

      {/* Enterprise Invoice Document Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInvoice?.invoiceNumber || 'COMMERCIAL INVOICE'}
        subtitle={`TENANT: ${selectedInvoice?.customer?.name || 'Axiom Lunar Research'} // PERIOD: SEP 2026`}
        badge={selectedInvoice?.status || 'POSTED'}
        badgeType="nominal"
        width="w-full max-w-2xl"
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">RECORD ID: #{selectedInvoice?.id}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6] font-bold uppercase"
              >
                <Printer className="w-3.5 h-3.5" />
                PRINT / EXPORT
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-3 py-1.5 rounded bg-[#06B6D4] text-[#080B10] font-bold uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        }
      >
        {selectedInvoice && (
          <div className="p-4 bg-[#0C1118] border border-[#283443] rounded space-y-4 text-xs font-mono">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-[#283443]">
              <div>
                <h2 className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider">
                  LUNAR HABITAT RESOURCE INFRASTRUCTURE
                </h2>
                <p className="text-[10px] text-[#657184] uppercase mt-0.5">
                  COMMERCIAL SETTLEMENT & BILLING DIVISION • MARE TRANQUILLITATIS BASE
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-[#06B6D4] block">{selectedInvoice.invoiceNumber}</span>
                <span className="text-[10px] text-[#98A3B3]">STATUS: {selectedInvoice.status}</span>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">TENANT / ENTITY</span>
                <span className="font-bold text-[#F1F4F6]">{selectedInvoice.customer?.name || 'Axiom Lunar'}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">BILLING PERIOD</span>
                <span className="font-bold text-[#F1F4F6]">SOL 0160 — 0187</span>
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">ISSUE DATE</span>
                <span className="font-bold text-[#F1F4F6] tabular-nums">{selectedInvoice.invoiceDate || '2026-09-20'}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">DUE DATE</span>
                <span className="font-bold text-[#F1F4F6] tabular-nums">{selectedInvoice.dueDate || '2026-10-20'}</span>
              </div>
            </div>

            {/* Resource Usage Breakdown Table */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider block mb-2">
                RESOURCE USAGE & LEASE CHARGES
              </span>
              <table className="w-full text-left text-[11px]">
                <thead className="text-[#657184] border-b border-[#283443] text-[9px] uppercase">
                  <tr>
                    <th className="pb-1.5">SERVICE / RESOURCE</th>
                    <th className="pb-1.5 text-right">METERED USAGE</th>
                    <th className="pb-1.5 text-right">RATE</th>
                    <th className="pb-1.5 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283443]/60">
                  <tr>
                    <td className="py-2 text-[#F1F4F6]">
                      <span className="font-bold block">Oxygen Atmospheric Provision</span>
                      <span className="text-[9px] text-[#657184]">High-purity medical O2 delivery</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">14,200 L</td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">₹0.45/L</td>
                    <td className="py-2 text-right tabular-nums font-bold text-[#F1F4F6]">₹6,390.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#F1F4F6]">
                      <span className="font-bold block">Potable Water Reclamation</span>
                      <span className="text-[9px] text-[#657184]">Closed-loop domestic purification</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">3,400 L</td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">₹1.20/L</td>
                    <td className="py-2 text-right tabular-nums font-bold text-[#F1F4F6]">₹4,080.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#F1F4F6]">
                      <span className="font-bold block">Habitat CO2 Scrubber Services</span>
                      <span className="text-[9px] text-[#657184]">Catalytic LiOH absorption duty cycle</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">27 Sols</td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">₹120.00/Sol</td>
                    <td className="py-2 text-right tabular-nums font-bold text-[#F1F4F6]">₹3,240.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-[#F1F4F6]">
                      <span className="font-bold block">Dome Alpha Commercial Lease</span>
                      <span className="text-[9px] text-[#657184]">Habitation Module Section 4A</span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">1 Month</td>
                    <td className="py-2 text-right tabular-nums text-[#98A3B3]">₹15,000.00</td>
                    <td className="py-2 text-right tabular-nums font-bold text-[#F1F4F6]">₹15,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-[#283443] flex justify-end">
              <div className="w-64 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#98A3B3]">
                  <span>SUBTOTAL</span>
                  <span className="tabular-nums font-bold text-[#F1F4F6]">
                    ₹{Number(selectedInvoice.total || 28710).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>LUNAR JURISDICTION TAX (0%)</span>
                  <span className="tabular-nums font-bold text-[#F1F4F6]">₹0.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#F1F4F6] border-t border-[#283443] pt-1.5">
                  <span>TOTAL INVOICED</span>
                  <span className="text-[#06B6D4] tabular-nums">
                    ₹{Number(selectedInvoice.total || 28710).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span>AMOUNT PAID</span>
                  <span className="tabular-nums">
                    ₹{Number(selectedInvoice.paidAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#F59E0B] font-bold">
                  <span>OUTSTANDING BALANCE</span>
                  <span className="tabular-nums">
                    ₹{Number(selectedInvoice.balanceDue || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
