
import { UpiHome } from "@/components/upi/UpiHome";
import { UpiPay } from "@/components/upi/UpiPay";
import { UpiScan } from "@/components/upi/UpiScan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, Send, Home } from "lucide-react";

export default function UpiPage() {
  return (
    <div className="flex justify-center w-full min-h-[calc(100vh-100px)]">
      {/* Mobile Container Visual */}
      <div className="w-full max-w-md bg-slate-950 border-x border-slate-800 min-h-full flex flex-col relative shadow-2xl shadow-black">

        {/* App Header */}
        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">ZA</div>
            <div>
              <h2 className="text-sm font-semibold text-white">Zahid&apos;s Account</h2>
              <p className="text-xs text-slate-500">zahid@okaxis</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4">
          <Tabs defaultValue="home" className="w-full h-full flex flex-col">
            <div className="flex-1">
              <TabsContent value="home" className="mt-0 space-y-6">
                <UpiHome />
              </TabsContent>
              <TabsContent value="scan" className="mt-0 h-full">
                <UpiScan />
              </TabsContent>
              <TabsContent value="pay" className="mt-0 h-full">
                <UpiPay />
              </TabsContent>
            </div>

            {/* Bottom Nav Bar (Floating) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs z-20">
              <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-full p-2 shadow-xl shadow-black/50">
                <TabsList className="grid grid-cols-3 bg-transparent h-auto p-0">
                  <TabsTrigger value="home" className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300">
                    <Home className="h-5 w-5" />
                    <span className="text-[10px]">Home</span>
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300">
                    <Scan className="h-5 w-5" />
                    <span className="text-[10px]">Scan</span>
                  </TabsTrigger>
                  <TabsTrigger value="pay" className="flex flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300">
                    <Send className="h-5 w-5" />
                    <span className="text-[10px]">Pay</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
