
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"
import { VoiceRecorder } from "./VoiceRecorder"

export function ReportFraudDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("")
  const [desc, setDesc] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type || !desc) return

    setIsSubmitting(true)
    try {
      const res = await fetch("http://localhost:8000/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "Anonymous User", // Could be dynamic if we had auth
          type: type,
          content: desc,
          location: "Mumbai, IN", // Default or fetch real loc
          avatarSeed: Math.random().toString(36).substring(7)
        })
      })

      if (res.ok) {
        setOpen(false)
        setType("")
        setDesc("")
        // Optional: Trigger a refresh of the feed via context or prop
        window.location.reload() // Simple way to refresh for now
      }
    } catch (e) {
      console.error("Failed to post report", e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-lg shadow-rose-900/20">
          <AlertTriangle className="h-4 w-4" /> Report Fraud
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">Report Suspicious Activity</DialogTitle>
          <DialogDescription className="text-slate-400">
            Alert the community about potential scams. Your report will be verified by AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-slate-300">Scam Type</Label>
            <Input
              id="type"
              placeholder="e.g. UPI Request, Phishing Link"
              className="bg-slate-900 border-slate-800 placeholder:text-slate-600"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="desc" className="text-slate-300">Description</Label>
              <div className="scale-75 origin-right">
                <VoiceRecorder onTranscript={(text) => setDesc(prev => prev + " " + text)} />
              </div>
            </div>
            <Textarea
              id="desc"
              placeholder="Describe what happened... (Tap mic to speak)"
              className="bg-slate-900 border-slate-800 placeholder:text-slate-600 min-h-[100px]"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="evi" className="text-slate-300">Evidence (Optional)</Label>
            <Input id="evi" type="file" className="bg-slate-900 border-slate-800" />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !type || !desc}
            className="bg-rose-600 hover:bg-rose-700 text-white w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
