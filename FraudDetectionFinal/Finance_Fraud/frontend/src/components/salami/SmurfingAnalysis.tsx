
import { Activity, AlertCircle, ShieldAlert, TrendingUp, Zap } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface SmurfingAnalysisProps {
    transactions: any[]
}

export const SmurfingAnalysis = ({ transactions }: SmurfingAnalysisProps) => {
    const { t } = useLanguage()
    const latestTx = transactions[0] || {}
    const totalCount = transactions.length

    // Calculate average amount
    const avgAmount = totalCount > 0
        ? transactions.reduce((acc, tx) => acc + tx.amount, 0) / totalCount
        : 0

    // Velocity Level - Updated to match the new 7-transaction threshold
    const isCritical = totalCount >= 7
    const velocity = isCritical ? t('risk_critical') : totalCount > 3 ? t('risk_elevated') : t('risk_normal')

    return (
        <div className="space-y-6">
            {/* Risk Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldAlert className="h-24 w-24 text-rose-500" />
                </div>

                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-rose-500" />
                    {t('neural_smurfing')}
                </h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-4xl font-black text-white tracking-tighter">Salami Attack</p>
                        <p className="text-rose-400 font-bold uppercase text-xs mt-1 tracking-widest">{t('velocity_pattern')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{t('freq_rate')}</p>
                            <p className="text-xl font-mono text-white">{totalCount > 0 ? "0.2s" : "N/A"}</p>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{t('risk_level')}</p>
                            <p className={`text-xl font-mono ${isCritical ? 'text-rose-500' : totalCount > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {velocity}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Feed */}
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    {t('pattern_analytics')}
                </p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-sm text-slate-300">{t('avg_tx_size')}</p>
                        </div>
                        <p className="text-sm font-bold text-white">₹{avgAmount.toFixed(4)}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 uppercase font-bold tracking-tighter">{t('velocity_score')}</span>
                            <span className="text-rose-400 font-bold">{Math.min(totalCount * 25, 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-rose-500 transition-all duration-500"
                                style={{ width: `${Math.min(totalCount * 25, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {totalCount > 0 && (
                    <div className={`${isCritical ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'} border p-4 rounded-xl flex gap-3 items-start`}>
                        <AlertCircle className={`h-5 w-5 ${isCritical ? 'text-rose-500' : 'text-blue-500'} shrink-0`} />
                        <div>
                            <p className={`text-xs font-bold ${isCritical ? 'text-rose-300' : 'text-blue-300'}`}>
                                {isCritical ? t('attack_confirmed') : t('pattern_monitoring')}
                            </p>
                            <p className={`text-[10px] ${isCritical ? 'text-rose-400/80' : 'text-blue-400/80'} mt-1 leading-relaxed`}>
                                {isCritical
                                    ? t('threshold_hit').replace('{count}', totalCount.toString())
                                    : t('monitoring_behavior')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
