
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UpiTimelineProps {
    transactions: any[]
}

export const UpiTimeline = ({ transactions }: UpiTimelineProps) => {
    // Sort transactions by timestamp (newest first)
    const sortedTxs = [...transactions].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return (
        <div className="bg-white rounded-[2rem] h-full shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-6 pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">←</div>
                    <p className="font-bold text-slate-800">UPI Lite</p>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-6">January 2026</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-7 pt-4 pb-8">
                {sortedTxs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                        <p>No transactions yet</p>
                    </div>
                ) : sortedTxs.map((tx, idx) => {
                    const isFailed = tx.is_blocked || tx.status === 'blocked';
                    const logoMap: Record<string, string> = {
                        'Food': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Zomato_logo.png',
                        'Micro-Payment': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Subway_logo.svg/1024px-Subway_logo.svg.png'
                    };

                    return (
                        <div key={tx.transaction_id || idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-11 w-11 border-2 border-slate-50 shadow-sm">
                                    <AvatarImage src={logoMap[tx.merchant_category] || `https://api.dicebear.com/7.x/initials/svg?seed=${tx.merchant_category}`} className="object-cover" />
                                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">{tx.merchant_category?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="text-[14px] font-bold text-slate-800 leading-tight">
                                        {tx.merchant_category === 'Food' ? 'Zomato food dietary' :
                                            tx.merchant_category === 'Micro-Payment' ? 'Subway food dietary' :
                                                tx.merchant_category || "Transfer"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        {new Date(tx.timestamp).toLocaleString('en-US', {
                                            month: 'long', day: 'numeric',
                                            hour: 'numeric', minute: '2-digit', hour12: true
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className={`text-[14px] font-bold ${isFailed ? 'text-slate-400' : 'text-slate-800'}`}>
                                    - ₹{tx.amount.toFixed(2)}
                                </p>
                                {isFailed && (
                                    <span className="text-[10px] font-black text-rose-500 uppercase mt-0.5">Failed</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search Bar - Aesthetic Only */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                <div className="h-1 w-12 bg-slate-300 rounded-full" />
            </div>
        </div>
    )
}
