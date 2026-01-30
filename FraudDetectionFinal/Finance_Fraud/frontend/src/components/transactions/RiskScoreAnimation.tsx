
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface RiskScoreAnimationProps {
  score: number | null
  isAnalyzing: boolean
}

export const RiskScoreAnimation = ({ score, isAnalyzing }: RiskScoreAnimationProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isAnalyzing) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 30)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  if (!score && !isAnalyzing) return null

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur w-full h-full min-h-[300px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        {isAnalyzing ? (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full h-32 w-32" />
            <div
              className="absolute inset-0 border-4 border-emerald-500 rounded-full h-32 w-32 border-t-transparent animate-spin"
            />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-200">{progress}%</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Scanning</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-50 duration-500">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto border-4 ${score! < 30 ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' :
              score! < 70 ? 'border-amber-500 bg-amber-500/20 text-amber-500' :
                'border-rose-500 bg-rose-500/20 text-rose-500'
              }`}>
              {score! < 30 ? <CheckCircle2 className="h-10 w-10" /> :
                score! < 70 ? <AlertTriangle className="h-10 w-10" /> :
                  <XCircle className="h-10 w-10" />}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {score! < 30 ? 'Transaction Safe' : score! < 70 ? 'Review Required' : 'Fraud Detected'}
              </h3>
              <p className="text-slate-400">Risk Score: <span className="text-white font-mono">{score}/100</span></p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
