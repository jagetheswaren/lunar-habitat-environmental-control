import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { Users, RefreshCw, Mail, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [data, setData] = useState<T.Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedContact, setSelectedContact] = useState<T.Contact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchContacts = async () => {
    try {
      const records = await api.contacts.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = data.filter(item => {
    if (typeFilter === 'ALL') return true;
    return item.type === typeFilter;
  });

  const columns: Column<T.Contact>[] = [
    {
      header: 'NAME',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.name}
        </span>
      ),
    },
    {
      header: 'TYPE',
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
            r.type === 'CUSTOMER'
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
              : r.type === 'VENDOR'
              ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
              : 'bg-[#161F2A] text-[#98A3B3] border-[#283443]'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      header: 'PRIMARY CONTACT',
      render: r => (
        <div>
          <span className="text-[#F1F4F6] block">{r.email || 'comms@orbital.corp'}</span>
          <span className="text-[10px] text-[#657184]">{r.phone || 'FREQ-414.2'}</span>
        </div>
      ),
    },
    {
      header: 'OPEN BALANCE',
      render: r => {
        // Open balance display
        const bal = (r as any).openBalance || 0;
        return (
          <span className={`font-bold tabular-nums ${bal > 0 ? 'text-[#F59E0B]' : 'text-[#F1F4F6]'}`}>
            ₹{Number(bal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
      align: 'right',
    },
    {
      header: 'STATUS',
      render: () => <StatusBadge status="ACTIVE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="ENTITY & CONTACT DIRECTORY"
        subtitle="ENTERPRISE ERP DIRECTORY // TENANTS, LOGISTICS CONTRACTORS & MISSION VENDORS"
        icon={Users}
        badge="ERP DIRECTORY"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchContacts();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#111820] border border-[#283443] rounded w-fit text-[11px]">
        {(['ALL', 'CUSTOMER', 'VENDOR'] as const).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1 rounded font-bold uppercase transition-colors ${
              typeFilter === type
                ? 'bg-[#161F2A] border border-[#06B6D4] text-[#06B6D4]'
                : 'text-[#98A3B3] hover:text-[#F1F4F6]'
            }`}
          >
            {type === 'CUSTOMER' ? 'TENANTS / CUSTOMERS' : type === 'VENDOR' ? 'VENDORS & SUPPLIERS' : 'ALL ENTITIES'}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="NO ENTITIES FOUND MATCHING CURRENT FILTER"
        searchable
        searchPlaceholder="SEARCH CONTACTS (NAME, EMAIL, FREQUENCY)..."
        onRowClick={row => {
          setSelectedContact(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedContact?.id}
        pageSize={25}
      />

      {/* Contact Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedContact?.name || 'ENTITY DETAILS'}
        subtitle={`RELATIONSHIP: ${selectedContact?.type || 'CUSTOMER'} // ID: #${selectedContact?.id}`}
        badge="VERIFIED"
        badgeType="nominal"
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">RECORD ID: #{selectedContact?.id}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedContact && (
          <div className="space-y-4 font-mono text-xs">
            {/* Company Info */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                COMPANY INFORMATION
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 text-[#F1F4F6]">
                  <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>{selectedContact.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[#98A3B3]">
                  <Mail className="w-3.5 h-3.5 text-[#657184]" />
                  <span>{selectedContact.email || 'comms@orbital.corp'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#98A3B3]">
                  <Phone className="w-3.5 h-3.5 text-[#657184]" />
                  <span>{selectedContact.phone || 'FREQ-414.2 MHZ'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#98A3B3]">
                  <MapPin className="w-3.5 h-3.5 text-[#657184]" />
                  <span>{selectedContact.address || 'Lunar Station Sector 01, Tranquillity Dome'}</span>
                </div>
              </div>
            </div>

            {/* Billing Details & Open Balance */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                BILLING & RECONCILIATION SUMMARY
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] block">PAYMENT TERMS</span>
                  <span className="font-bold text-[#F1F4F6]">NET 30 DAYS</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">OPEN BALANCE</span>
                  <span className="font-bold text-[#F59E0B]">₹0.00</span>
                </div>
              </div>
            </div>

            {/* Related Documents */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                LINKED TRANSACTION DOCUMENTS
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-1.5 bg-[#111820] border border-[#283443] rounded flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#F1F4F6]">
                    <FileText className="w-3.5 h-3.5 text-[#06B6D4]" />
                    INVOICES ON RECORD
                  </span>
                  <span className="text-[#10B981] font-bold">14 SETTLED</span>
                </div>
                <div className="p-1.5 bg-[#111820] border border-[#283443] rounded flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#F1F4F6]">
                    <CreditCard className="w-3.5 h-3.5 text-[#10B981]" />
                    ELECTRONIC PAYMENTS
                  </span>
                  <span className="text-[#F1F4F6] font-bold">14 RECONCILED</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
