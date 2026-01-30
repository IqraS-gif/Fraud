
"use client"

import { fraudAlerts } from "@/data/demo-community"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ShieldCheck, MessageSquare, ArrowBigUp, ArrowBigDown, MapPin, Share2 } from "lucide-react"

export const FraudFeed = () => {
  return (
    <div className="space-y-4">
      {fraudAlerts.map((alert) => (
        <Card key={alert.id} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <Avatar className="border border-slate-700">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${alert.avatarSeed}`} />
                  <AvatarFallback>{alert.user[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{alert.user}</p>
                    {alert.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{alert.timestamp}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-medium">{alert.type}</span>
                    {alert.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {alert.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3 text-slate-300 text-sm leading-relaxed">
            {alert.content}
          </CardContent>
          <CardFooter className="pt-0 flex justify-between items-center text-slate-500">
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-full p-1 border border-slate-800">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500">
                <ArrowBigUp className="h-5 w-5" />
              </Button>
              <span className="text-xs font-bold text-white w-8 text-center">{alert.trustScore}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-rose-500/10 hover:text-rose-500">
                <ArrowBigDown className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs hover:text-white">
                <MessageSquare className="h-4 w-4" /> {alert.comments}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs hover:text-white">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
