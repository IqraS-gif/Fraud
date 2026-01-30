"use client"

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/cards/KpiCard";
import { RiskChart } from "@/components/charts/RiskChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { TransactionStream } from "@/components/dashboard/TransactionStream";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { ModelConfidence } from "@/components/dashboard/ModelConfidence";
import { Banknote, ShieldAlert, Activity, Users, Siren, ShieldCheck, AlertTriangle } from "lucide-react";
import API_URL from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_URL}/alerts`);
        const data = await res.json();
        if (data.status === "success") {
          setAlerts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const activeAlertsCount = alerts.length;
  const highSevAlerts = alerts.filter(a => a.severity === 'High');

  return (
    <div className="space-y-8">
      {/* High Severity Banner */}
      {highSevAlerts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500 text-rose-500 px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse">
          <Siren className="h-5 w-5" />
          <span className="font-bold">CRITICAL ALERT: {highSevAlerts[0].message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('command_center')}</h2>
          <p className="text-slate-400 mt-1">{t('dashboard_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20">
            {t('generate_report')}
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={t('total_transactions')} value="2.4M" icon={Activity} description={t('trend_up')} trend="up" />
        <KpiCard title={t('fraud_prevented')} value="₹1.2Cr" icon={ShieldCheck} description={t('saved_month')} trend="up" />
        <KpiCard
          title={t('active_alerts')}
          value={activeAlertsCount.toString()}
          icon={AlertTriangle}
          description={highSevAlerts.length > 0 ? "High Severity Detected" : t('requires_attention')}
          trend={highSevAlerts.length > 0 ? "up" : "down"}
        />
        <KpiCard title={t('system_load')} value="42%" icon={Activity} description={t('optimal_performance')} trend="neutral" />
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Main Charts Area */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TrendChart />
            <RiskChart />
          </div>

          {/* System Status Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <SystemHealth />
            <ModelConfidence />
          </div>
        </div>

        {/* Right Sidebar - Transaction Stream */}
        <div className="col-span-12 lg:col-span-4">
          <TransactionStream />
        </div>
      </div>
    </div>
  );
}
