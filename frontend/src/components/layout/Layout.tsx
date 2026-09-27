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
    <div className="min-h-screen bg-[#080B10] text-[#F1F4F6] flex relative overflow-hidden font-sans">
      {/* Background Starfield Canvas */}
      <StarfieldCanvas />

      {/* Persistent Left Mission Control Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 ml-[230px] flex flex-col min-h-screen relative z-10 bg-[#0C1118]/80">
        <Header currentPath={currentPath} onLogout={onLogout} />
        <main className="flex-1 p-4 md:p-5 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
