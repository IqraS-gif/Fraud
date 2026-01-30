
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RiskCardProps {
  score: number;
  level: "Low" | "Medium" | "High" | "Critical";
}

export const RiskCard = ({ score, level }: RiskCardProps) => {
  const getColor = (level: string) => {
    switch (level) {
      case "Low": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Medium": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "High": return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "Critical": return "bg-red-100 text-red-800 hover:bg-red-100";
      default: return "";
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">{score}/100</div>
          <Badge className={getColor(level)} variant="secondary">{level}</Badge>
        </div>
        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
