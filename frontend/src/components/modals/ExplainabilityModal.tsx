
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { MapPin, Zap, CheckCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface ExplainabilityModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | number
  riskScore: number
  aiReasoning?: string
}

export function ExplainabilityModal({ isOpen, onClose, transactionId, riskScore, aiReasoning }: ExplainabilityModalProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-slate-800 bg-slate-950 text-slate-200 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-rose-600" />

        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-2">
            <span className={riskScore > 70 ? "text-rose-500" : riskScore > 30 ? "text-amber-500" : "text-emerald-500"}>
              {riskScore > 70 ? t('critical_risk_insights') : riskScore > 30 ? t('moderate_risk_analysis') : t('low_risk_analysis')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            {t('deep_analysis_id')} <span className="font-mono text-slate-300">#{transactionId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
              <span>{t('weighted_probability')}</span>
              <span className="font-bold">{riskScore}%</span>
            </div>
            <Progress
              value={riskScore}
              className={`h-2 bg-slate-800`}
              indicatorClassName={riskScore > 70 ? "bg-rose-500" : riskScore > 30 ? "bg-amber-500" : "bg-emerald-500"}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="h-3 w-3 text-emerald-500" />
              {t('ai_reasoning_engine')}
            </h4>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-sm leading-relaxed text-slate-300 whitespace-pre-wrap font-medium shadow-inner">
              {aiReasoning || t('default_ai_reasoning')}
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-4 ${riskScore > 70 ? "bg-rose-500/5 border-rose-500/10" : "bg-emerald-500/5 border-emerald-500/10"
            }`}>
            <div className={`p-2 rounded-full ${riskScore > 70 ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
              <CheckCircle className={`h-4 w-4 ${riskScore > 70 ? "text-rose-500" : "text-emerald-500"}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t('final_recommendation')}</p>
              <p className="text-sm font-bold text-slate-200">
                {riskScore > 70 ? t('block_recommendation') : t('allow_recommendation')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
