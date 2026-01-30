
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

interface FraudAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onAllowAnyway?: () => void
  amount: string
  recipient: string
  reason?: string
  riskScore?: number
}

export function FraudAlertModal({ isOpen, onClose, onAllowAnyway, amount, recipient, reason, riskScore }: FraudAlertModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] border-rose-500/50 bg-rose-950 text-rose-100">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-900/50 mb-4 animate-pulse">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-rose-500">Security Alert</DialogTitle>
          <DialogDescription className="text-center text-rose-200/80">
            We blocked this transaction to protect your account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4 text-center bg-rose-900/20 rounded-lg border border-rose-500/20">
          <div className="font-bold text-2xl text-rose-100">₹{amount}</div>
          <div className="text-sm text-rose-300">To: <span className="font-medium text-white">{recipient || "Unknown"}</span></div>
          {reason && (
            <div className="mt-2 text-xs bg-rose-950 py-1 px-2 rounded inline-block mx-auto border border-rose-800 text-rose-400">
              Reason: {reason}
            </div>
          )}
          {riskScore !== undefined && (
            <div className="text-xs text-rose-500 mt-1">
              Risk Score: {riskScore.toFixed(1)}%
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-2">
          <Button variant="destructive" className="w-full bg-rose-600 hover:bg-rose-700 text-white" onClick={onClose}>
            Stop Payment
          </Button>
          {onAllowAnyway && (
            <Button variant="ghost" className="w-full text-rose-400 hover:text-rose-200 hover:bg-rose-900/50" onClick={onAllowAnyway}>
              I know this person, Allow
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
