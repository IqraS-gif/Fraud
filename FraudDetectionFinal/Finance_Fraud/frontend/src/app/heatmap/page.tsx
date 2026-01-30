"use client"

import { useState, useEffect } from "react"
import { IndiaMap } from "@/components/heatmap/IndiaMap"
import { RiskFilters } from "@/components/heatmap/RiskFilters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, TrendingUp, AlertOctagon, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedNumber } from "@/components/ui/AnimatedNumber"
import { useLanguage } from "@/context/LanguageContext"

export default function HeatmapPage() {
  const { t, language } = useLanguage()
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [pins, setPins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/fraud-heatmap")
        const json = await res.json()

        if (json.status === "success") {
          const points = json.data.map((item: any) => ({
            location: { lat: item.location.lat, lng: item.location.lng },
            weight: item.weight
          }))
          setHeatmapData(points)
          if (json.pins) setPins(json.pins)
        }
      } catch (error) {
        console.error("Failed to load heatmap data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  } as const

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <Activity className="text-rose-500 animate-pulse" />
          {t('threat_intel_map')}
        </h2>
        <p className="text-slate-400">{t('real_time_geo_risk')}</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RiskFilters />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Map Area */}
        <motion.div className="lg:col-span-8 h-[600px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative group" variants={itemVariants}>
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-10" />
          <IndiaMap heatmapData={heatmapData} pins={pins} />
        </motion.div>

        {/* Side Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-700/50 shadow-lg hover:border-rose-500/30 transition-all duration-300 group">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-xs font-bold uppercase tracking-widest flex justify-between">
                  {t('national_alert_level')}
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="h-16 w-16 rounded-full bg-slate-950/50 text-rose-500 flex items-center justify-center border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                      <ShieldAlert className="h-8 w-8 animate-[pulse_3s_ease-in-out_infinite]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                      {loading ? "..." : t('risk_critical')}
                    </p>
                    <p className="text-xs text-rose-300 font-mono">
                      {pins.length > 0 ? `${t('active_cluster')}: ${pins[0].title.toUpperCase()}` : t('scanning_sectors')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-700/50 shadow-lg overflow-hidden flex flex-col h-[350px]">
              <CardHeader className="pb-2 bg-slate-950/30">
                <CardTitle className="text-slate-200 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  {t('top_risky_zones')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 overflow-y-auto custom-scrollbar flex-1">
                <AnimatePresence>
                  {pins.slice(0, 5).map((pin, index) => (
                    <motion.div
                      key={pin.location.lat + pin.location.lng} // Unique key
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/20 border border-slate-700/30 cursor-crosshair group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`font-mono font-bold text-sm h-6 w-6 rounded flex items-center justify-center ${index === 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                          index === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-slate-700/30 text-slate-400"
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-rose-200 transition-colors">
                            {pin.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-950/50 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                              {t('risk_label')}: <AnimatedNumber value={pin.severity} />
                            </span>
                            {pin.common_fraud_type && (
                              <span className="text-[9px] text-amber-400/80 font-bold uppercase tracking-tighter">
                                {pin.common_fraud_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <AlertOctagon className={`h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity ${index === 0 ? "text-rose-500" : "text-slate-600"
                        }`} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {pins.length === 0 && !loading && (
                  <div className="text-center py-10 text-slate-500 text-xs">{t('no_active_threats')}</div>
                )}
                {loading && <div className="text-center py-10 text-slate-500 text-xs animate-pulse">{t('syncing_db')}</div>}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 relative overflow-hidden group">
              {/* Animated highlight */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

              <p className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                {t('ai_strategic_insight')}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                &quot;{t('pattern_recolognition_active')} <span className="text-white font-semibold">{t('active_cluster')} {pins[0]?.title}</span> exhibits anomalous high-frequency transactions matching <span className="text-amber-300">{pins[0]?.common_fraud_type?.toLowerCase() || t('known_signatures')}</span> signatures. {t('recommend_friction')}&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
