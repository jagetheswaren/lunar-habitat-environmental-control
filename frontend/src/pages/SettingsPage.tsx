import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Settings, Server, Database, Globe2, Shield, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="MISSION CONSOLE CONFIGURATION & ARCHITECTURE"
        subtitle="RUNTIME PARAMETERS // DATABASE REPLICATION, API SPECS & SCADA TELEMETRY BUS"
        icon={Settings}
        badge="PRODUCTION ARCHITECTURE"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend Runtime */}
        <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#283443]">
            <Server className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              BACKEND APPLICATION RUNTIME
            </h3>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">FRAMEWORK</span>
              <span className="text-[#F1F4F6] font-bold">SPRING BOOT 3.4.3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">JDK RUNTIME</span>
              <span className="text-[#F1F4F6] font-bold">JAVA 17 / 21 LTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">API BASE URL</span>
              <span className="text-[#06B6D4] font-bold">{import.meta.env.VITE_API_URL || 'http://localhost:8081'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">REST API ROUTES</span>
              <span className="text-[#F1F4F6] font-bold">/api/v1/lunar/** & /api/v2/**</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#657184]">SECURITY AUTH</span>
              <span className="text-[#10B981] font-bold">SPRING SECURITY 6.4 + JWT (HS256)</span>
            </div>
          </div>
        </div>

        {/* Database & Migrations */}
        <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#283443]">
            <Database className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              PERSISTENCE & FLYWAY MIGRATIONS
            </h3>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">DATABASE ENGINE</span>
              <span className="text-[#F1F4F6] font-bold">MYSQL 8.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">MIGRATION APPLIED</span>
              <span className="text-[#10B981] font-bold">FLYWAY V7 (27 TABLES SEEDED)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">JPA ORM</span>
              <span className="text-[#F1F4F6] font-bold">HIBERNATE 6.6</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#657184]">DOUBLE-ENTRY RULE</span>
              <span className="text-[#10B981] font-bold">STRICT EQUILIBRIUM ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Visual System */}
        <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#283443]">
            <Cpu className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              LUNAR OPERATIONS SYSTEM DESIGN
            </h3>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">DESIGN SYSTEM</span>
              <span className="text-[#F1F4F6] font-bold">LUNAR OPERATIONS SYSTEM (SCADA)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">WORKSPACE PALETTE</span>
              <span className="text-[#06B6D4] font-bold">VOID #080B10 / WORKSPACE #0C1118</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#657184]">TYPOGRAPHY</span>
              <span className="text-[#F1F4F6] font-bold">IBM PLEX MONO & IBM PLEX SANS</span>
            </div>
          </div>
        </div>

        {/* Client Runtime */}
        <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#283443]">
            <Globe2 className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              CLIENT APPLICATION HOST
            </h3>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">BUILD ENGINE</span>
              <span className="text-[#F1F4F6] font-bold">VITE 5 + TYPESCRIPT 5</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#283443]/60">
              <span className="text-[#657184]">SPATIAL TWIN</span>
              <span className="text-[#10B981] font-bold">THREE.JS WEBGL RENDERER</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#657184]">DEPLOYMENT HOST</span>
              <span className="text-[#06B6D4] font-bold">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
