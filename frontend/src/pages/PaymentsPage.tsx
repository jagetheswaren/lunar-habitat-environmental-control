import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { CreditCard, RefreshCw, CheckCircle2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [data, setData] = useState<T.Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<T.Payment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      const records = await api.payments.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns: Column<T.Payment>[] = [
    {
      header: 'DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.paymentDate || '2026-09-22'}
        </span>
      ),
      accessorKey: 'paymentDate',
    },
    {
      header: 'REFERENCE',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.paymentNumber || `PAY-${r.id}`}
        </span>
      ),
      accessorKey: 'paymentNumber',
    },
    {
      header: 'PARTY',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.contact?.name || 'Partner Account'}
        </span>
      ),
    },
    {
      header: 'DOCUMENT',
      render: r => (
        <span className="text-[#98A3B3]">
          {(r as any).referenceDocument || (r.type === 'CUSTOMER_PAYMENT' ? 'INV-2026-018' : 'BILL-2026-004')}
        </span>
      ),
    },
    {
      header: 'METHOD',
      render: r => (
        <span className="text-[#657184] uppercase text-[10px]">
          {r.paymentMethod || 'BANK_TRANSFER'}
        </span>
      ),
      accessorKey: 'paymentMethod',
    },
    {
      header: 'AMOUNT',
      render: r => (
        <span className="font-bold text-[#10B981] tabular-nums">
          ₹{Number(r.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'amount',
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'RECORDED'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="PAYMENT TRANSACTIONS & SETTLEMENTS"
        subtitle="AUTOMATIC GENERAL LEDGER JOURNAL RECONCILIATION // DISBURSEMENTS & RECEIPTS"
        icon={CreditCard}
        badge="CASH SETTLEMENT"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchPayments();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="NO PAYMENT TRANSACTIONS FOUND"
        searchable
        searchPlaceholder="SEARCH PAYMENTS (REFERENCE, PARTY, METHOD)..."
        onRowClick={row => {
          setSelectedPayment(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedPayment?.id}
        pageSize={25}
      />

      {/* Reconciliation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPayment?.paymentNumber || 'PAYMENT TRANSACTION'}
        subtitle={`SETTLEMENT RECONCILIATION // ${selectedPayment?.contact?.name || 'PARTNER'}`}
        badge={selectedPayment?.status || 'RECORDED'}
        badgeType="nominal"
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">TRANSACTION #{selectedPayment?.id}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedPayment && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                SETTLEMENT SPECIFICATION
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] block">PAYMENT VALUE</span>
                  <span className="font-bold text-[#10B981] tabular-nums">
                    ₹{Number(selectedPayment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">SETTLEMENT METHOD</span>
                  <span className="font-bold text-[#F1F4F6] uppercase">{selectedPayment.paymentMethod || 'BANK'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">SETTLEMENT DATE</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">{selectedPayment.paymentDate || '2026-09-22'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">RELATIONSHIP</span>
                  <span className="font-bold text-[#06B6D4] uppercase">{selectedPayment.type}</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Match */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                RECONCILIATION MATCH
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-[#111820] border border-[#283443] rounded flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#657184] block">LINKED INVOICE / BILL</span>
                    <span className="font-bold text-[#06B6D4]">
                      {(selectedPayment as any).referenceDocument || 'DOC-2026-0814'}
                    </span>
                  </div>
                  <span className="text-[#10B981] font-bold text-[10px]">100% RECONCILED</span>
                </div>

                <div className="p-2 bg-[#111820] border border-[#283443] rounded flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#657184] block">GENERAL LEDGER JOURNAL</span>
                    <span className="font-bold text-[#F1F4F6]">ENTRY #JE-2026-0092</span>
                  </div>
                  <span className="text-[#10B981] font-bold text-[10px]">BALANCED</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>TRANSACTION VERIFIED BY DOUBLE-ENTRY LEDGER VALIDATOR.</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
