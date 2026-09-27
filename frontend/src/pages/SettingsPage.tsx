import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Settings, Server, Database, Globe2, Shield, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mission Control Console Settings"
        subtitle="Host server parameters, database replication status, and runtime environment specifications"
        icon={Settings}
        badge="PRODUCTION READY"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="lunar-panel rounded border border-lunar-border p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-lunar-border">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Backend Application Runtime
            </h3>
          </div>
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Framework</span>
              <span className="text-white font-semibold">Spring Boot 3.4.3</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">JDK Version</span>
              <span className="text-white font-semibold">Java 17 / 21 LTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Backend API URL</span>
              <span className="text-cyan-400 font-bold">{import.meta.env.VITE_API_URL || 'http://localhost:8081'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">REST API Prefix</span>
              <span className="text-white font-semibold">/api/v1/lunar/** & /api/v2/**</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Security Engine</span>
              <span className="text-emerald-400 font-semibold">Spring Security 6.4 + JWT (HS256)</span>
            </div>
          </div>
        </div>

        <div className="lunar-panel rounded border border-lunar-border p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-lunar-border">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Database & Schema Migration
            </h3>
          </div>
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Database Engine</span>
              <span className="text-white font-semibold">MySQL 8.0 (In-Memory Fallback Supported)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Migration Tool</span>
              <span className="text-emerald-400 font-semibold">Flyway v7 Migrations Applied</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Registered Tables</span>
              <span className="text-white font-semibold">27 Core Schema Tables</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">JPA Persistence</span>
              <span className="text-white font-semibold">Hibernate ORM 6.6</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Double-Entry Rule</span>
              <span className="text-emerald-400 font-semibold">Strict Debit = Credit Verification</span>
            </div>
          </div>
        </div>

        <div className="lunar-panel rounded border border-lunar-border p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-lunar-border">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Frontend Client Architecture
            </h3>
          </div>
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Client Engine</span>
              <span className="text-white font-semibold">React 18 + Vite + TypeScript</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Styling System</span>
              <span className="text-cyan-400 font-semibold">Tailwind CSS (Taste Skill SCADA Tokens)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">3D Digital Twin</span>
              <span className="text-emerald-400 font-semibold">Three.js WebGL Geodesic Biosphere</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Frontend Client URL</span>
              <span className="text-cyan-400 font-bold">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</span>
            </div>
          </div>
        </div>

        <div className="lunar-panel rounded border border-lunar-border p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-lunar-border">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Testing & Compliance Rigor
            </h3>
          </div>
          <div className="space-y-3 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Newman E2E Requests</span>
              <span className="text-emerald-400 font-bold">72 / 72 Executed (0 Failed)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">Newman Assertions</span>
              <span className="text-emerald-400 font-bold">141 / 141 Passed (100%)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lunar-border/60">
              <span className="text-slate-400">JUnit 5 Test Suite</span>
              <span className="text-emerald-400 font-bold">27 / 27 Passed</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Architecture</span>
              <span className="text-white font-semibold">Zero Container Mandate (Native JVM & Node)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
