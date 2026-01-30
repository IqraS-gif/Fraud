
"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Play, FileJson } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RiskScoreAnimation } from "./RiskScoreAnimation"
import { AnalysisResultModal } from "./AnalysisResultModal"
import { useLanguage } from "@/context/LanguageContext"

export const TransactionSimulator = () => {
  const { t, language } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  // New states for Hybrid System
  const [showResultModal, setShowResultModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [scenarioName, setScenarioName] = useState("")
  const [currentUserId, setCurrentUserId] = useState("") // New state
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form Data State
  const [formData, setFormData] = useState({
    user_id: "ACC_1001",
    amount: 5000,
    transaction_type: "Transfer",
    merchant_category: "General",
    location: "Mumbai",
    device_used: "Mobile",
    time_since_last_transaction: 12,
    spending_deviation_score: 1.0,
    velocity_score: 1.0,
    geo_anomaly_score: 1.0,
    payment_channel: "UPI",
    lat: 19.0760,
    long: 72.8777,
    receiver_account: "Unknown"
  })

  const [isBatchRunning, setIsBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })

  // Reused Logic for API Call
  const performAnalysis = async (data: any, description: string) => {
    setIsAnalyzing(true)
    setScore(null)

    try {
      // Call Backend
      const response = await fetch("http://localhost:8000/analyze-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, language })
      })

      const result = await response.json()
      if (result.status === "success") {
        setAnalysisResult(result.data)
        setScenarioName(description)
        setCurrentUserId(data.user_id || "Unknown")
        setShowResultModal(true)
        // Also update the local score animation for flair
        setScore(Math.round(result.data.fraud_probability * 100))

        // Voice Alert for Blocked/High Risk
        if (result.data.is_blocked || result.data.risk_level === 'Critical' || result.data.risk_level === 'High') {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.5);

          gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);

          let alertText = "";
          if (result.data.reasoning.includes("BLOCKED ENTITY")) {
            alertText = "Security Alert! Blocked Entity Detected! Immediate Action Required!";
          } else {
            alertText = `Critical Alert! Fraud Detected! ${description || 'High risk transaction identified'}. Beware!`;
          }

          const utterance = new SpeechSynthesisUtterance(alertText);
          utterance.rate = 1.0;
          utterance.pitch = 1.2;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }

        // Trigger global refresh for history table
        window.dispatchEvent(new CustomEvent('refresh-transactions'))
      }
    } catch (err) {
      console.error("Failed to analyze:", err)
      if (!isBatchRunning) alert(t('invalid_json_alert') || "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualAnalyze = () => {
    performAnalysis(formData, "Manual Simulation")
  }

  const handleStartBatch = async () => {
    setIsBatchRunning(true)
    try {
      const res = await fetch("/finaltestcase.json")
      const testCases = await res.json()
      setBatchProgress({ current: 0, total: testCases.length })

      for (let i = 0; i < testCases.length; i++) {
        setBatchProgress(prev => ({ ...prev, current: i + 1 }))
        const { test_case, description } = testCases[i]
        await performAnalysis(test_case, description)

        // Wait for modal to be seen or just small delay for effect
        await new Promise(r => setTimeout(r, 4000))
        setShowResultModal(false)
        await new Promise(r => setTimeout(r, 500))
      }
    } catch (err) {
      console.error("Batch failure:", err)
    } finally {
      setIsBatchRunning(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const testCase = json.test_case || json
        const description = json.description || t('uploaded_test_case')

        await performAnalysis(testCase, description)

      } catch (err) {
        console.error("Failed to parse JSON:", err)
        alert(t('invalid_json_alert'))
        setIsAnalyzing(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-200">{t('transaction_simulator')}</CardTitle>
          <CardDescription className="text-slate-500">{t('simulator_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="manual" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">{t('manual_entry')}</TabsTrigger>
              <TabsTrigger value="bulk" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">{t('json_scenarios')}</TabsTrigger>
            </TabsList>
            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">

                {/* Section 1: Core Details */}
                <div className="space-y-3 p-3 rounded-lg bg-slate-800/20 border border-slate-700/30">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="user_id" className="text-xs text-slate-400">User ID</Label>
                      <Input id="user_id" placeholder="ACC_1001" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount" className="text-xs text-slate-400">Amount (₹)</Label>
                      <Input id="amount" type="number" placeholder="5000" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="type" className="text-xs text-slate-400">Type</Label>
                      <Input id="type" placeholder="Transfer" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.transaction_type} onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs text-slate-400">Category</Label>
                      <Input id="category" placeholder="Groceries" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.merchant_category} onChange={(e) => setFormData({ ...formData, merchant_category: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recipient" className="text-xs text-slate-400">Recipient</Label>
                    <Input id="recipient" placeholder="Receiver ID" className="h-8 bg-slate-900 border-slate-700 text-xs"
                      value={formData.receiver_account} onChange={(e) => setFormData({ ...formData, receiver_account: e.target.value })} />
                  </div>
                </div>

                {/* Section 2: Context & Device */}
                <div className="space-y-3 p-3 rounded-lg bg-slate-800/20 border border-slate-700/30">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Context & Device</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-xs text-slate-400">Location</Label>
                      <Input id="location" placeholder="Mumbai" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="device" className="text-xs text-slate-400">Device</Label>
                      <Input id="device" placeholder="Mobile" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.device_used} onChange={(e) => setFormData({ ...formData, device_used: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lat" className="text-xs text-slate-400">Latitude</Label>
                      <Input id="lat" type="number" placeholder="19.0760" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="long" className="text-xs text-slate-400">Longitude</Label>
                      <Input id="long" type="number" placeholder="72.8777" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.long} onChange={(e) => setFormData({ ...formData, long: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Risk Factors */}
                <div className="space-y-3 p-3 rounded-lg bg-slate-800/20 border border-slate-700/30">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Risk Signals (Simulated)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="velocity" className="text-[10px] text-slate-400">Velocity</Label>
                      <Input id="velocity" type="number" placeholder="1.0" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.velocity_score} onChange={(e) => setFormData({ ...formData, velocity_score: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="deviation" className="text-[10px] text-slate-400">Deviation</Label>
                      <Input id="deviation" type="number" placeholder="1.0" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.spending_deviation_score} onChange={(e) => setFormData({ ...formData, spending_deviation_score: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="geo_score" className="text-[10px] text-slate-400">Geo Score</Label>
                      <Input id="geo_score" type="number" placeholder="1.0" className="h-8 bg-slate-900 border-slate-700 text-xs"
                        value={formData.geo_anomaly_score} onChange={(e) => setFormData({ ...formData, geo_anomaly_score: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <Label htmlFor="time_since" className="text-xs text-slate-400">Time Since Last (hrs)</Label>
                    <Input id="time_since" type="number" placeholder="24" className="h-8 bg-slate-900 border-slate-700 text-xs"
                      value={formData.time_since_last_transaction} onChange={(e) => setFormData({ ...formData, time_since_last_transaction: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>

              </div>

              <Button onClick={handleManualAnalyze} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4 h-10 shadow-lg shadow-emerald-900/20" disabled={isAnalyzing}>
                {isAnalyzing ? t('analyzing') : <><Play className="mr-2 h-4 w-4" /> Run Simulation</>}
              </Button>
            </TabsContent>
            <TabsContent value="bulk" className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
              <div className="grid gap-4">
                <div
                  onClick={() => !isBatchRunning && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-slate-700 rounded-lg p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${isBatchRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/10'}`}
                >
                  <FileJson className="h-10 w-10 text-slate-500 mb-2 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-sm text-slate-400 font-medium">{t('upload_json_test')}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('select_scenario')}</p>
                </div>

                <div className="relative overflow-hidden p-4 rounded-xl bg-slate-950 border border-slate-800 group transition-all duration-300">
                  {isBatchRunning && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      className="absolute bottom-0 left-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">{isBatchRunning ? "Batch Progress" : "Consolidated Test Case"}</p>
                      <p className="text-[10px] text-slate-500">finaltestcase.json (6 Case Series)</p>
                    </div>
                    {isBatchRunning && (
                      <span className="text-xs font-mono text-emerald-400 font-bold">{batchProgress.current} / {batchProgress.total}</span>
                    )}
                  </div>
                  <Button
                    onClick={handleStartBatch}
                    disabled={isBatchRunning || isAnalyzing}
                    className={`w-full h-10 font-bold transition-all duration-300 ${isBatchRunning ? 'bg-slate-800 cursor-wait' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/20'}`}
                  >
                    {isBatchRunning ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        Running Batch...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4 fill-current" />
                        Start All Transactions
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="text-emerald-500 font-bold uppercase mr-2">{t('note')}:</span>
                  {t('hybrid_note')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="h-full">
        <RiskScoreAnimation score={score} isAnalyzing={isAnalyzing} />
      </div>

      <AnalysisResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={analysisResult}
        scenarioDescription={scenarioName}
        userId={currentUserId}
      />
    </div>
  )
}
