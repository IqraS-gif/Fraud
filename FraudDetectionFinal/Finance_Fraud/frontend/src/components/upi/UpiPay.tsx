
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react"
import { FraudAlertModal } from "@/components/modals/FraudAlertModal"

export const UpiPay = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input')
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [recipient] = useState("alex@upi")
  const [showFraudModal, setShowFraudModal] = useState(false)

  const handlePay = () => {
    if (!amount) return

    setStep('processing')

    // Simulate processing and risk check
    setTimeout(() => {
      // Mock Risk Check: If amount ends in '9', trigger fraud (e.g. 999)
      if (amount.endsWith('9')) {
        setShowFraudModal(true)
        setStep('input') // Reset for demo purposes after modal close
        return
      }

      setStep('success')
    }, 2000)
  }

  const reset = () => {
    setStep('input')
    setAmount("")
    setNote("")
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

        {/* Pay Button */}
        <div className="pt-8">
          <Button onClick={handlePay} className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">
              Pay ₹{amount || '0'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <div className="flex justify-center mt-4">
            <p className="text-xs text-slate-500">Powered by UPI & FraudGuard AI</p>
          </div>
        </div>
      </div>

      <FraudAlertModal
        isOpen={showFraudModal}
        onClose={() => setShowFraudModal(false)}
        amount={amount}
        recipient={recipient}
      />
    </>
  )
}
