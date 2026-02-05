"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import API_URL from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, ShieldCheck, ArrowRight, User, Briefcase } from "lucide-react"
import { FraudAlertModal } from "@/components/modals/FraudAlertModal"

interface UserProfile {
  id: string
  name: string
  type: "personal" | "business"
}

export const UpiPay = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input')
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [recipient] = useState("alex@upi")
  const [showFraudModal, setShowFraudModal] = useState(false)
  const [fraudReason, setFraudReason] = useState<string>("")
  const [riskScore, setRiskScore] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // New state for user profiles
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("user_common")
  const [dailySpent, setDailySpent] = useState<number>(0)
  const [dailyLimit, setDailyLimit] = useState<number>(50000)

  // Fetch users on mount
  useEffect(() => {
    // Fetch Users
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users)
          const firstUser = data.users[0]
          setSelectedUser(firstUser.id)
          setDailyLimit(firstUser.type === "business" ? 1000000 : 50000)
          fetchUserHistory(firstUser.id)
        }
      })
      .catch(err => console.error("Failed to fetch users:", err))
  }, [])

  const fetchUserHistory = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/history`)
      const data = await res.json()
      setDailySpent(data.daily_total || 0)
    } catch (err) {
      console.error("Failed to fetch user history:", err)
    }
  }

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
    const user = users.find(u => u.id === userId)
    if (user) {
      setDailyLimit(user.type === "business" ? 1000000 : 50000)
    }
    fetchUserHistory(userId)
  }

  const handlePay = async () => {
    if (!amount) return

    setStep('processing')
    setErrorMessage(null)

    try {
      const response = await fetch(`${API_URL}/analyze-upi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser,
          amount: Number(amount),
          time_gap: 30,
          daily_total: 0
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const result = await response.json()

      if (result.daily_spent !== undefined) setDailySpent(result.daily_spent)
      if (result.daily_limit !== undefined) setDailyLimit(result.daily_limit)

      if (result.verdict === "BLOCKED") {
        setFraudReason(result.reason)
        setRiskScore(result.risk_score)
        setShowFraudModal(true)
        setStep('input')
        return
      }

      if (result.verdict === "FLAGGED") {
        const confirmProceed = window.confirm(
          `⚠️ This transaction looks suspicious: ${result.reason}\n\nAre you sure you want to proceed?`
        )
        if (!confirmProceed) {
          setStep('input')
          return
        }
      }

      setStep('success')

    } catch (err) {
      console.error("Sentinel API Error:", err)
      setErrorMessage("❌ Security system offline. Cannot verify transaction.")
      setStep('input')
    }
  }

  const reset = () => {
    setStep('input')
    setAmount("")
    setNote("")
    fetchUserHistory(selectedUser)
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-in fade-in duration-500">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-200">Processing Securely</h3>
          <p className="text-slate-500">AI is verifying this transaction...</p>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in zoom-in-50 duration-500">
        <CheckCircle2 className="h-24 w-24 text-emerald-500" />
        <div>
          <h3 className="text-3xl font-bold text-white">₹{amount}</h3>
          <p className="text-slate-400 mt-2">Paid to {recipient}</p>
        </div>
        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span className="text-sm text-slate-300">Protected by FraudGuard AI</span>
        </div>
        <Button onClick={reset} variant="outline" className="mt-4">Done</Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-4 duration-500">

        {/* User Selector */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-400 mb-2">Select User Profile</label>
          <div className="grid grid-cols-2 gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserChange(user.id)}
                className={`p-3 rounded-lg border-2 transition-all ${selectedUser === user.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2 justify-center">
                  {user.type === 'business' ? (
                    <Briefcase className="h-4 w-4 text-amber-500" />
                  ) : (
                    <User className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-sm text-white font-medium truncate">{user.name}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 capitalize">{user.type}</div>
              </button>
            ))}
          </div>

          {/* Daily Spending Info */}
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-sm">
            <span className="text-slate-400">Daily Spent:</span>
            <span className="text-white font-medium">₹{dailySpent.toLocaleString()} / ₹{dailyLimit.toLocaleString()}</span>
          </div>
          <div className="mt-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${dailySpent / dailyLimit > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((dailySpent / dailyLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Recipient Info */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16 border-2 border-slate-800">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${recipient}`} />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-medium text-white">Paying Alex Coporp</h3>
            <p className="text-sm text-slate-400">{recipient}</p>
            <p className="text-xs text-emerald-500 flex items-center justify-center gap-1 mt-1">
              <ShieldCheck className="h-3 w-3" /> Verified Merchant
            </p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="relative max-w-[200px] mx-auto">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">₹</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-center text-4xl font-bold h-20 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-700"
            autoFocus
          />
        </div>

        {/* Note Input */}
        <div className="max-w-xs mx-auto">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="text-center bg-slate-900/50 border-slate-800 rounded-full text-slate-300 focus-visible:ring-slate-700"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-xs mx-auto p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
            {errorMessage}
          </div>
        )}

        {/* Pay Button */}
        <div className="pt-8">
          <Button onClick={handlePay} className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">
              Pay ₹{amount || '0'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <div className="flex justify-center mt-4">
            <p className="text-xs text-slate-500">Powered by UPI & FraudGuard AI + Firebase</p>
          </div>
        </div>
      </div>

      <FraudAlertModal
        isOpen={showFraudModal}
        onClose={() => setShowFraudModal(false)}
        onAllowAnyway={() => {
          setShowFraudModal(false)
          setStep('success')
        }}
        amount={amount}
        recipient={recipient}
        reason={fraudReason}
        riskScore={riskScore}
      />
    </>
  )
}
