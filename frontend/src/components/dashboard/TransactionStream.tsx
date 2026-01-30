
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { transactions } from "@/data/demo-transactions"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react"

import { useLanguage } from "@/context/LanguageContext"

export const TransactionStream = () => {
  const { t } = useLanguage()
  // Duplicate transactions to create scrolling effect size
  const streamData = [...transactions, ...transactions];

  return (
    <Card className="col-span-1 border-slate-800 bg-slate-900/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-slate-200">{t('live_transaction_stream')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900/90 to-transparent z-10" />

          <div className="space-y-4 px-6 animate-[accordion-up_20s_linear_infinite]">
            {streamData.map((tx, i) => (
              <div key={`${tx.id}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tx.recipient}</p>
                    <p className="text-xs text-slate-500">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'debit' ? '-' : '+'}₹{tx.amount}
                  </p>
                  {tx.risk === 'high' && (
                    <Badge variant="outline" className="border-red-500/50 text-red-400 text-[10px] h-4 px-1 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {t('risk_label')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
        </div>
      </CardContent>
    </Card>
  )
}
