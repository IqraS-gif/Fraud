
import { FraudFeed } from "@/components/community/FraudFeed"
import { TrendingScams } from "@/components/community/TrendingScams"
import { ReportFraudDialog } from "@/components/community/ReportFraudDialog"
import { Users } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="h-6 w-6 text-emerald-500" />
            <h2 className="text-3xl font-bold tracking-tight text-white">Community Shield</h2>
          </div>
          <p className="text-slate-400">Crowd-sourced intelligence to stay one step ahead of scammers.</p>
        </div>
        <ReportFraudDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-8">
          <FraudFeed />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <TrendingScams />
        </div>
      </div>
    </div>
  )
}
