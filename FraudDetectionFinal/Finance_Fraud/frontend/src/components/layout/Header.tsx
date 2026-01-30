
"use client"

import { Bell, Search, Languages } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/context/LanguageContext"

export function Header() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/50">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">FraudGuard AI</h2>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 gap-1.5 hidden md:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t('system_online')}
          </Badge>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {/* Language Toggle */}
          <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'hi' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              HI
            </button>
          </div>

          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('search_placeholder')}
              className="pl-9 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
            />
          </div>

          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium leading-none text-slate-200">{t('admin_user')}</p>
              <p className="text-xs text-slate-500">{t('security_analyst')}</p>
            </div>
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
