
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Database, Activity } from "lucide-react"

import { useLanguage } from "@/context/LanguageContext"

export const SystemHealth = () => {
  const { t } = useLanguage()
  const metrics = [
    { label: t('api_latency'), value: "24ms", icon: Activity, status: "good" },
    { label: t('fraud_model'), value: t('active_status'), icon: Server, status: "good" },
    { label: t('database'), value: t('healthy_status'), icon: Database, status: "good" },
  ]

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-200">{t('system_health')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <m.icon className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-lg font-bold text-slate-200">{m.value}</p>
            <p className="text-xs text-slate-500">{m.label}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">{t('operational')}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
