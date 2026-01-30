
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
}

export const KpiCard = ({ title, value, icon: Icon, description, trend }: KpiCardProps) => {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur hover:bg-slate-900/80 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-emerald-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <div className={`text-xs px-1.5 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700/50 text-slate-300'}`}>
              {trend.toUpperCase()}
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
