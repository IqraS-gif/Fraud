'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Header } from "@/components/layout/Header";
import { AIBrainWidget } from "@/components/layout/AIBrainWidget";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return (
      <main className="w-full min-h-screen bg-slate-950 text-slate-200">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200">
      {/* Sidebar - Fixed width */}
      <div className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 h-full w-full">
        <Header />
        <main className="flex-1 overflow-y-auto bg-grid-slate-900/[0.04] relative animate-in fade-in duration-500">
          {/* Background effect */}
          <div className="absolute inset-0 bg-slate-950 -z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
          <div className="p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <AIBrainWidget />
      </div>
    </div>
  );
}
