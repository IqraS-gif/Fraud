
"use client"

// Card imports removed as they are unused
import { Camera } from "lucide-react"

export const UpiScan = () => {
  return (
    <div className="flex flex-col h-full bg-black rounded-3xl overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h3 className="text-white text-center font-medium">Scan QR Code</h3>
      </div>
      <div className="flex-1 bg-slate-900 flex items-center justify-center relative">
        <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />

          <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-500/50 animate-[scan_2s_linear_infinite]" />
        </div>
        <Camera className="absolute text-white/10 h-32 w-32" />
      </div>
      <div className="p-6 bg-black text-center">
        <p className="text-slate-400 text-sm">Align QR code within the frame to scan</p>
      </div>
    </div>
  )
}
