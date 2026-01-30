
"use client"

import { trendingScams } from "@/data/demo-community"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Flame, TrendingUp } from "lucide-react"

export const TrendingScams = () => {
  return (
    <Card className="bg-slate-900/50 border-slate-800 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-pulse" /> Trending Threats
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {trendingScams.map((scam, i) => (
          <div key={scam.id} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-800 group-hover:text-slate-700 transition-colors">0{i + 1}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{scam.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="h-3 w-3" /> {scam.growth}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
