
"use client"

import { useState, useEffect } from "react"
import { BrainCircuit, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export const AIBrainWidget = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'learning'>('idle')
  const [confidence, setConfidence] = useState(98)
  const [isExpanded, setIsExpanded] = useState(false)

  // Simulate AI "Aliveness"
  useEffect(() => {
    const interval = setInterval(() => {
      const states: ('idle' | 'scanning' | 'learning')[] = ['idle', 'scanning', 'learning']
      const randomState = states[Math.floor(Math.random() * states.length)]
      setStatus(randomState)

      // Randomize confidence slightly
      setConfidence(prev => Math.min(99.9, Math.max(94, prev + (Math.random() - 0.5) * 2)))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] transition-all duration-300 ease-in-out cursor-pointer group",
        isExpanded ? "w-64 h-auto" : "w-16 h-16 hover:scale-105"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={cn(
        "absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all",
        status === 'scanning' && "border-blue-500/50 shadow-blue-500/20",
        status === 'learning' && "border-emerald-500/50 shadow-emerald-500/20",
        status === 'idle' && "border-slate-700 shadow-slate-900/50"
      )}>
        {/* Compact View (Brain Icon) */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="relative">
            <div className={cn(
              "absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse",
              status === 'learning' && "bg-emerald-500",
              status === 'scanning' && "bg-blue-400 duration-300"
            )} />
            <BrainCircuit className={cn(
              "h-8 w-8 text-slate-200 relative z-10 transition-colors",
              status === 'scanning' && "text-blue-400 animate-pulse",
              status === 'learning' && "text-emerald-400"
            )} />
          </div>
        </div>

        {/* Expanded View (Stats) */}
        <div className={cn(
          "p-5 flex flex-col gap-3 transition-opacity duration-300",
          isExpanded ? "opacity-100 delay-75" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl relative overflow-hidden">
              <div className={cn(
                "absolute inset-0 opacity-20 animate-pulse",
                status === 'scanning' ? "bg-blue-500" : "bg-emerald-500"
              )} />
              <BrainCircuit className="h-6 w-6 text-white relative z-10" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-none mb-1">FraudGuard AI</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {status === 'scanning' ? 'Analysing Traffic...' : status === 'learning' ? 'Updating Model...' : 'System Active'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Confidence</span>
              <span className="text-emerald-400 font-bold">{confidence.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>72ms Latency</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Activity className="h-3 w-3 text-blue-400" />
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
