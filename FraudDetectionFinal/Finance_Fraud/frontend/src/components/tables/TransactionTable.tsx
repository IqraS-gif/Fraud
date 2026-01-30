
"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExplainabilityModal } from "@/components/modals/ExplainabilityModal"
import { Search, RotateCcw } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

export function TransactionTable() {
  const { t } = useLanguage()
  const [txHistory, setTxHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTx, setSelectedTx] = useState<any | null>(null)

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      // Fetch for both test users for now
      const [res1, res2] = await Promise.all([
        fetch("http://localhost:8000/transactions/ACC_1001"),
        fetch("http://localhost:8000/transactions/ACC_2002")
      ])

      const data1 = await res1.json()
      const data2 = await res2.json()

      const allTxs = [...(data1.data || []), ...(data2.data || [])]

      // Smart Sort: 
      // 1. Prioritize 'TX_' (simulator) over 'T_' (old demo)
      // 2. Sort by timestamp within those groups
      allTxs.sort((a, b) => {
        const aIsLive = a.transaction_id?.startsWith('TX_');
        const bIsLive = b.transaction_id?.startsWith('TX_');

        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;

        // Final fallback to timestamp
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      setTxHistory(allTxs)
    } catch (err) {
      console.error("Failed to fetch history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()

    // Listen for custom event from simulator
    const handleRefresh = () => fetchHistory()
    window.addEventListener('refresh-transactions', handleRefresh)
    return () => window.removeEventListener('refresh-transactions', handleRefresh)
  }, [])

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          {t('live_analysis_history')}
          {isLoading && <span className="text-[10px] lowercase font-normal italic text-slate-500">{t('syncing')}</span>}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchHistory}
          disabled={isLoading}
          className="h-8 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
        >
          <RotateCcw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800 hover:bg-slate-900/50 text-[11px] uppercase tracking-wider">
            <TableHead className="text-slate-500">{t('date_time')}</TableHead>
            <TableHead className="text-slate-500">{t('user_id')}</TableHead>
            <TableHead className="text-slate-500">{t('merchant_cat')}</TableHead>
            <TableHead className="text-slate-500">{t('location')}</TableHead>
            <TableHead className="text-slate-500">{t('status')}</TableHead>
            <TableHead className="text-slate-500">{t('risk')}</TableHead>
            <TableHead className="text-right text-slate-500">{t('amount')}</TableHead>
            <TableHead className="text-right text-slate-500">{t('details')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-slate-500 italic">
                {t('no_transactions')}
              </TableCell>
            </TableRow>
          ) : txHistory.map((tx) => (
            <TableRow key={tx.transaction_id} className="border-slate-800 hover:bg-slate-800/50 transition-colors group">
              <TableCell className="font-mono text-[10px] text-slate-400">
                {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell className="font-bold text-slate-300 text-xs">{tx.user_id}</TableCell>
              <TableCell className="text-slate-400 text-xs">
                {tx.merchant_category}
              </TableCell>
              <TableCell className="text-slate-500 text-xs group-hover:text-slate-300 transition-colors">{tx.location}</TableCell>
              <TableCell>
                <Badge variant={tx.status === "completed" ? "default" : "destructive"}
                  className={`text-[10px] tracking-tighter uppercase font-black border-none ${tx.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}
                >
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${tx.risk_level === 'Critical' ? 'bg-rose-500 animate-pulse' :
                    tx.risk_level === 'High' ? 'bg-orange-500' : 'bg-emerald-500'
                    }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${tx.risk_level === 'Critical' ? 'text-rose-400' :
                    tx.risk_level === 'High' ? 'text-orange-400' : 'text-emerald-400'
                    }`}>
                    {tx.risk_level}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-slate-300">
                ₹{tx.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-slate-500 hover:text-white hover:bg-slate-800 uppercase font-black"
                  onClick={() => setSelectedTx(tx)}
                >
                  <Search className="h-3 w-3 mr-1" /> {t('view_ai')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTx && (
        <ExplainabilityModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          transactionId={selectedTx.transaction_id}
          riskScore={Math.round(selectedTx.fraud_probability * 100)}
          aiReasoning={selectedTx.reasoning}
        />
      )}
    </div>
  )
}
