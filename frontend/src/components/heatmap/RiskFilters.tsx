
"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const RiskFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-400 mr-2">Timeframe:</span>
        <Tabs defaultValue="1h" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-400 mr-2">Type:</span>
        <Tabs defaultValue="all" className="w-[250px]">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upi">UPI</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
