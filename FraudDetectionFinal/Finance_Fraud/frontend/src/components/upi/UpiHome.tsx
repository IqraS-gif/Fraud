
"use client"

import { QrCode, User, Smartphone, Building2, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { recentUpiTransactions } from "@/data/demo-upi"

export const UpiHome = () => {
  // Icons for the top grid
  const actions = [
    { icon: QrCode, label: "Scan QR", color: "text-blue-500" },
    { icon: User, label: "Pay Contacts", color: "text-blue-500" },
    { icon: Smartphone, label: "Pay Phone", color: "text-blue-500" },
    { icon: Building2, label: "Bank Transfer", color: "text-blue-500" },
  ]

  // Mock people data
  const people = [
    ...recentUpiTransactions,
    { id: 'p4', name: 'Mom', upiId: 'mom@upi', amount: 0, date: '' },
    { id: 'p5', name: 'Landlord', upiId: 'rent@upi', amount: 0, date: '' },
  ]

  return (
    <div className="space-y-6">
      {/* Top Grid - GPay Style */}
      <div className="grid grid-cols-4 gap-4 text-center">
        {actions.map((action, i) => (
          <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="h-12 w-12 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <span className="text-[10px] font-medium text-slate-300 leading-3">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-slate-800" />

      {/* People Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">People</h3>
        </div>
        <div className="grid grid-cols-4 gap-y-4 text-center">
          {people.map((person) => (
            <div key={person.id} className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
              <Avatar className="h-14 w-14 border-2 border-slate-800">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`} />
                <AvatarFallback className="bg-slate-700 text-slate-300">{person.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-slate-300 truncate w-full">{person.name.split(' ')[0]}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="h-14 w-14 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center">
              <ChevronRight className="h-6 w-6 text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-300">More</span>
          </div>
        </div>
      </div>

      {/* Example Promo Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-500/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-blue-200">Invite friends to FraudGuard</p>
          <p className="text-xs text-blue-300/70">Get ₹201 after first payment</p>
        </div>
        <GiftIcon className="h-8 w-8 text-yellow-500" />
      </div>
    </div>
  )
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}
