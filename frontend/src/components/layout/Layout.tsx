import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StarfieldCanvas } from '../3d/StarfieldCanvas';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({
  currentPath,
  onNavigate,
  onLogout,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#F0F4F8] flex relative overflow-hidden">
      {/* Background Starfield Canvas */}
      <StarfieldCanvas />

      {/* Persistent Left Mission Control Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen relative z-10">
        <Header currentPath={currentPath} onLogout={onLogout} />
        <main className="flex-1 p-5 overflow-y-auto max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
