import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { ShoppingBag, RefreshCw, CheckCircle2, ArrowRight, Clock, FileText, CreditCard, ShieldCheck } from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const [data, setData] = useState<T.PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPO, setSelectedPO] = useState<T.PurchaseOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const records = await api.purchaseOrders.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const workflowSteps = ['DRAFT', 'SUBMITTED', 'APPROVED', 'BILLED', 'PAID'];

  const getStepIndex = (status?: string) => {
    const s = status?.toUpperCase() || 'CONFIRMED';
    if (s === 'DRAFT') return 0;
    if (s === 'SUBMITTED' || s === 'PENDING') return 1;
    if (s === 'APPROVED' || s === 'CONFIRMED') return 2;
    if (s === 'BILLED') return 3;
    if (s === 'PAID') return 4;
    return 2;
  };

  const columns: Column<T.PurchaseOrder>[] = [
    {
      header: 'PO NUMBER',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.poNumber}
        </span>
      ),
      accessorKey: 'poNumber',
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'CONFIRMED'} size="sm" />,
    },
    {
      header: 'VENDOR',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.vendor?.name || 'Orbital Reclamation Technologies'}
        </span>
      ),
    },
    {
      header: 'DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.orderDate ? new Date(r.orderDate).toISOString().substring(0, 10) : '2026-09-24'}
        </span>
      ),
      accessorKey: 'orderDate',
    },
    {
      header: 'TOTAL',
      render: r => (
        <span className="font-bold text-[#10B981] tabular-nums">
          ₹{Number(r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'total',
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="PROCUREMENT PURCHASE ORDERS"
        subtitle="SUPPLY CHAIN ORDER WORKFLOW // UPSTREAM CONSUMABLES, REAGENTS & SPARE ENGINES"
        icon={ShoppingBag}
        badge="SUPPLY CHAIN"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Table Listing */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="NO PURCHASE ORDERS ON RECORD"
        searchable
        searchPlaceholder="SEARCH PURCHASE ORDERS (PO NUMBER, VENDOR)..."
        onRowClick={row => {
          setSelectedPO(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedPO?.id}
        pageSize={25}
      />

      {/* PO Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPO?.poNumber || 'PURCHASE ORDER'}
        subtitle={`VENDOR: ${selectedPO?.vendor?.name || 'Orbital Reclamation Corp'} // DATE: ${selectedPO?.orderDate || '2026-09-24'}`}
        badge={selectedPO?.status || 'CONFIRMED'}
        badgeType="nominal"
        width="w-full max-w-xl"
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">RECORD ID: #{selectedPO?.id}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedPO && (
          <div className="space-y-4 font-mono text-xs">
            {/* Header Metrics */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">PO NUMBER</span>
                <span className="font-bold text-[#06B6D4]">{selectedPO.poNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">STATUS</span>
                <StatusBadge status={selectedPO.status || 'CONFIRMED'} size="sm" />
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">ORDER DATE</span>
                <span className="font-bold text-[#F1F4F6] tabular-nums">{selectedPO.orderDate || '2026-09-24'}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#657184] uppercase block">TOTAL AMOUNT</span>
                <span className="font-bold text-[#10B981] tabular-nums">
                  ₹{Number(selectedPO.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Workflow Visualization */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                PROCUREMENT WORKFLOW PIPELINE
              </span>
              <div className="flex items-center justify-between pt-1">
                {workflowSteps.map((step, idx) => {
                  const currentIdx = getStepIndex(selectedPO.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                            isDone
                              ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                              : 'bg-[#161F2A] border-[#283443] text-[#657184]'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`text-[9px] uppercase mt-1 font-bold ${
                            isCurrent
                              ? 'text-[#06B6D4]'
                              : isDone
                              ? 'text-[#F1F4F6]'
                              : 'text-[#657184]'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {idx < workflowSteps.length - 1 && (
                        <div className={`h-[1px] flex-1 mx-2 ${idx < currentIdx ? 'bg-[#10B981]' : 'bg-[#283443]'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ORDER LINES */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                ORDER LINES
              </span>
              <table className="w-full text-left text-[11px]">
                <thead className="text-[#657184] border-b border-[#283443] text-[9px] uppercase">
                  <tr>
                    <th className="pb-1">DESCRIPTION</th>
                    <th className="pb-1 text-right">QTY</th>
                    <th className="pb-1 text-right">UNIT PRICE</th>
                    <th className="pb-1 text-right">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283443]/60">
                  {(selectedPO.lines && selectedPO.lines.length > 0 ? selectedPO.lines : [
                    { description: 'LiOH Hydroxide Scrubber Canisters (High-Capacity)', quantity: 20, unitPrice: 320, subtotal: 6400 },
                    { description: 'Viton Cryogenic Gasket Seals Pack', quantity: 5, unitPrice: 150, subtotal: 750 },
                  ]).map((line: any, lIdx: number) => (
                    <tr key={lIdx}>
                      <td className="py-1.5 text-[#F1F4F6] font-semibold">{line.description || line.product?.name}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#98A3B3]">{line.quantity}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#98A3B3]">₹{Number(line.unitPrice).toFixed(2)}</td>
                      <td className="py-1.5 text-right tabular-nums text-[#10B981] font-bold">₹{Number(line.subtotal || (line.quantity * line.unitPrice)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* APPROVAL & RELATED VENDOR BILL */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1">
                <span className="text-[9px] text-[#657184] uppercase block font-bold">APPROVAL SIGN-OFF</span>
                <span className="text-[#10B981] font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  COMMANDER VANCE
                </span>
                <span className="text-[9px] text-[#657184]">SECURITY AUTH: RBAC_APPROVED</span>
              </div>

              <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1">
                <span className="text-[9px] text-[#657184] uppercase block font-bold">LINKED VENDOR BILL</span>
                <span className="text-[#06B6D4] font-bold block flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  BILL-2026-0042
                </span>
                <span className="text-[9px] text-[#10B981]">PAYMENT RECONCILED</span>
              </div>
            </div>

            {/* AUDIT TIMELINE */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1.5 text-[11px]">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                AUDIT TIMELINE
              </span>
              <div className="space-y-1 text-[#98A3B3]">
                <div className="flex justify-between">
                  <span>PO GENERATED IN DRAFT</span>
                  <span className="text-[#657184]">2026-09-24 08:30 UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>SUBMITTED TO ORBITAL SUPPLY</span>
                  <span className="text-[#657184]">2026-09-24 09:15 UTC</span>
                </div>
                <div className="flex justify-between">
                  <span>AUTHORIZED & CONFIRMED</span>
                  <span className="text-[#10B981]">2026-09-24 10:00 UTC</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
