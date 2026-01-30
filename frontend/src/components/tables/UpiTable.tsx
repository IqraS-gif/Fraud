
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { recentUpiTransactions } from "@/data/demo-upi"

export function UpiTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800 hover:bg-slate-900/50">
            <TableHead className="text-slate-400">Name</TableHead>
            <TableHead className="text-slate-400">UPI ID</TableHead>
            <TableHead className="text-slate-400">Time</TableHead>
            <TableHead className="text-right text-slate-400">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentUpiTransactions.map((tx) => (
            <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
              <TableCell className="font-medium text-slate-300">{tx.name}</TableCell>
              <TableCell className="text-slate-400">{tx.upiId}</TableCell>
              <TableCell className="text-slate-500">{tx.date}</TableCell>
              <TableCell className="text-right text-emerald-400 font-medium">₹{tx.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
