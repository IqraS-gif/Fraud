
"use client";

import { LayoutDashboard, Wallet, Scan, Activity, Users, Settings, ShieldCheck, Zap } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { useLanguage } from "@/context/LanguageContext";

export const Sidebar = () => {
  const { t } = useLanguage();

  const routes = [
    {
      icon: LayoutDashboard,
      label: t('dashboard'),
      href: "/dashboard",
    },
    {
      icon: Wallet,
      label: t('transactions'),
      href: "/bank-transactions",
    },
    {
      icon: Scan,
      label: t('upi_payment'),
      href: "/upi",
    },
    {
      icon: Activity,
      label: t('heatmap'),
      href: "/heatmap",
    },
    {
      icon: Zap,
      label: t('salami_attack'),
      href: "/salami-attack",
    },
    {
      icon: Users,
      label: t('community'),
      href: "/community",
    },
    {
      icon: Settings,
      label: t('settings'),
      href: "/settings",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{t('fraud_guard')}</h1>
        </div>
      </div>

      <div className="flex flex-col w-full gap-1 mt-4">
        {routes.map((route) => (
          <SidebarItem
            key={route.href}
            icon={route.icon}
            label={route.label}
            href={route.href}
          />
        ))}
      </div>

      <div className="mt-auto p-6">
        <div className="rounded-xl bg-gradient-to-b from-slate-900 to-slate-900 border border-slate-800 p-4">
          <h4 className="text-sm font-medium text-slate-200 mb-1">AI Model v2.4</h4>
          <p className="text-xs text-slate-500 mb-3">Last updated: 2h ago</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 w-[94%] h-full rounded-full" />
          </div>
          <p className="text-[10px] text-emerald-400 mt-2 font-medium text-right">94% Accuracy</p>
        </div>
      </div>
    </div>
  );
};
