
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit } from "lucide-react"

import { useLanguage } from "@/context/LanguageContext"

export const ModelConfidence = () => {
  const { t } = useLanguage()

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-emerald-400" />
          {t('model_confidence_title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-bold text-slate-100">98.2%</span>
            <span className="text-sm text-emerald-400 ml-2">↑ 0.4%</span>
          </div>
          <p className="text-xs text-slate-500 mb-1">{t('last_24h')}</p>
        </div>
        <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-emerald-500 w-[98.2%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </CardContent>
    </Card>
  )
}
