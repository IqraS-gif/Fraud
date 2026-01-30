
"use client"

import { useState, useRef } from "react"
import { ShieldAlert, Play, RotateCcw, Smartphone, Cpu, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpiTimeline } from "@/components/salami/UpiTimeline"
import { SmurfingAnalysis } from "@/components/salami/SmurfingAnalysis"
import { useLanguage } from "@/context/LanguageContext"

export default function SalamiAttackPage() {
    const { t, language } = useLanguage()
    const [transactions, setTransactions] = useState<any[]>([])
    const [isSimulating, setIsSimulating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showAttackAlert, setShowAttackAlert] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const content = JSON.parse(e.target?.result as string)
                const cases = content.test_cases || [content.test_case]
                await runSalamiAttack(cases)
            } catch (err) {
                console.error("Invalid JSON:", err)
                alert(t('invalid_json_alert'))
            }
        }
        reader.readAsText(file)
    }

    const runSalamiAttack = async (customCases?: any[]) => {
        setIsSimulating(true)
        setTransactions([])
        setProgress(0)
        setShowAttackAlert(false)

        const defaultCases = Array(12).fill(null).map((_, i) => ({
            "user_id": "ACC_1001", "amount": 10.00 + (i * 2), "merchant_category": "Micro-Payment", "location": "Mumbai, MH", "receiver_account": "ACC_GPAY_SAM"
        }))

        const activeCases = customCases || defaultCases

        try {
            for (let i = 0; i < activeCases.length; i++) {
                const txStub = activeCases[i]

                // Spread timestamps throughout the day
                const spreadTime = new Date();
                spreadTime.setHours(spreadTime.getHours() - (Math.abs(activeCases.length - 1 - i) * 1.5));

                const isFail = i >= 7 // Fail from 8th onwards

                let reasoning = isFail ? "Salami Attack Detected: High frequency pattern confirmed." : "Transaction within normal limits."

                if (language === 'hi') {
                    reasoning = isFail
                        ? "सलामी अटैक का पता चला: उच्च आवृत्ति पैटर्न की पुष्टि हुई।"
                        : "लेनदेन सामान्य सीमा के भीतर।"
                }

                const newTx = {
                    ...txStub,
                    transaction_id: `TX_SALAMI_${i}_${Date.now()}`,
                    timestamp: spreadTime.toISOString(),
                    is_blocked: isFail,
                    status: isFail ? 'blocked' : 'completed',
                    reasoning: reasoning
                }

                // Add delay for effect
                const delay = Math.max(1200 - (i * 100), 100);
                await new Promise(r => setTimeout(r, delay))

                setTransactions(prev => [newTx, ...prev])
                setProgress(((i + 1) / activeCases.length) * 100)

                if (i === 7) {
                    setShowAttackAlert(true)
                    const utterance = new SpeechSynthesisUtterance("Critical Alert! Salami Attack Detected. Multiple high frequency transactions confirmed. Beware!");
                    utterance.rate = 0.9;
                    utterance.pitch = 1.1;
                    utterance.volume = 1.0;
                    window.speechSynthesis.speak(utterance);
                }
            }
        } catch (err) {
            console.error("Simulation failed:", err)
        } finally {
            setIsSimulating(false)
        }
    }

    return (
        <div className="h-full flex flex-col p-8 bg-slate-950 overflow-hidden relative">
            {/* Header Panel */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <ShieldAlert className="h-8 w-8 text-rose-500" />
                        {t('salami_simulator')}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">
                        {t('salami_subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".json"
                    />
                    <Button
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSimulating}
                        className="text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                    >
                        <Upload className="h-4 w-4 mr-2" /> {t('upload_json')}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => { setTransactions([]); setProgress(0); setShowAttackAlert(false); }}
                        className="border-slate-800 text-slate-400 hover:bg-slate-900"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" /> {t('reset')}
                    </Button>
                    <Button
                        onClick={() => runSalamiAttack()}
                        disabled={isSimulating}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 shadow-lg shadow-rose-500/20"
                    >
                        <Play className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} />
                        {isSimulating ? t('simulating') : t('launch_attack')}
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">

                {/* Left: UPI Timeline (Phone Wrapper) */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex justify-center items-start">
                    <div className="relative w-full max-w-[320px] aspect-[9/18.5] p-3 pt-6 bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden group">
                        {/* Phone Camera Hole */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-800 rounded-full z-20" />

                        <div className="h-full w-full rounded-[2rem] overflow-hidden bg-white relative">
                            <UpiTimeline transactions={transactions} />
                        </div>

                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 w-full px-8 py-2 flex justify-between items-center z-20 pointer-events-none">
                            <span className="text-[10px] font-bold text-slate-500">18:30</span>
                            <div className="flex gap-1.5 items-center">
                                <div className="h-2 w-2 rounded-full bg-slate-700" />
                                <div className="h-2 w-2 rounded-full bg-slate-800" />
                                <div className="h-3 w-5 border border-slate-700 rounded-sm flex items-center justify-center">
                                    <div className="h-1 w-3 bg-slate-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Analysis */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-8 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-800">

                    {/* Simulation Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Smartphone className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t('source_device')}</span>
                            </div>
                            <p className="text-xl font-bold text-slate-200 tracking-tight">Android v12 (UPI Lite)</p>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Cpu className="h-4 w-4 text-blue-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t('attack_progress')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs font-mono font-bold text-blue-400">{Math.round(progress)}%</span>
                            </div>
                        </div>

                        <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldAlert className="h-4 w-4 text-rose-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t('blocked_patterns')}</span>
                            </div>
                            <p className="text-xl font-bold text-rose-500 tracking-tight">
                                {transactions.filter(t => t.is_blocked).length} {t('suspicious')}
                            </p>
                        </div>
                    </div>

                    {/* Smurfing Logic Visualizer */}
                    <SmurfingAnalysis transactions={transactions} />

                    {/* Server Logs */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t('live_logs')}
                        </div>
                        <div className="bg-black/40 border border-slate-800 p-4 rounded-xl font-mono text-[10px] leading-relaxed h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-900">
                            {transactions.length === 0 && <p className="text-slate-700 italic">{t('waiting_signals')}</p>}
                            {transactions.map((tx, idx) => (
                                <p key={idx} className={tx.is_blocked ? "text-rose-400/90" : "text-emerald-400/70"}>
                                    <span className="text-slate-600">[{new Date(tx.timestamp).toLocaleTimeString()}]</span> {tx.is_blocked ? "⚠ ALERT:" : "✓ OK:"} TX_{tx.transaction_id.slice(-6)} | VAL: ₹{tx.amount.toFixed(2)} | DEST: {tx.receiver_account} | DECISION: {tx.is_blocked ? "BLOCK_FRAUD" : "PASS"}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Salami Attack Alert Modal */}
            {showAttackAlert && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                                <ShieldAlert className="h-8 w-8 text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                {t('attack_confirmed')}
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {t('threshold_hit').replace('{count}', '8')}
                            </p>

                            <div className="w-full bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mt-2">
                                <p className="text-xs text-rose-400 font-mono">
                                    ERR_SALAMI_DETECTED: High frequency micro-payments detected from single source.
                                </p>
                            </div>

                            <Button
                                onClick={() => setShowAttackAlert(false)}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold mt-4"
                            >
                                {t('acknowledge_analysis')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
