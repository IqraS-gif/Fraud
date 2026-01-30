
"use client"

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

export function ReportFraudDialog() {
  return (
    <Dialog>
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
            <Input id="type" placeholder="e.g. UPI Request, Phishing Link" className="bg-slate-900 border-slate-800 placeholder:text-slate-600" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc" className="text-slate-300">Description</Label>
            <Textarea id="desc" placeholder="Describe what happened..." className="bg-slate-900 border-slate-800 placeholder:text-slate-600 min-h-[100px]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="evi" className="text-slate-300">Evidence (Optional)</Label>
            <Input id="evi" type="file" className="bg-slate-900 border-slate-800" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white w-full">Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
