
"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  href: string
}

export const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (pathname === "/" && href === "/dashboard") || pathname === href || pathname?.startsWith(`${href}/`)

  const onClick = () => {
    router.push(href)
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-x-3 text-slate-400 text-sm font-medium px-4 py-3 rounded-lg mx-3 transition-all duration-300 ease-in-out hover:text-emerald-400 hover:bg-slate-900",
        isActive && "text-white bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 rounded-none mx-0 pl-7 shadow-none hover:bg-emerald-500/5 hover:text-white"
      )}
    >
      <Icon
        size={20}
        className={cn(
          "text-slate-400 group-hover:text-emerald-400 transition-colors",
          isActive && "text-emerald-400"
        )}
      />
      {label}
    </button>
  )
}
