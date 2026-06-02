// components/admin-template/floating-trigger.tsx
"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function FloatingTrigger() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <div className="sticky top-0 flex items-center w-0 h-screen z-50 pointer-events-none">
      <button
        onClick={toggleSidebar}
        /* Ditambahkan 'pointer-events-auto' agar tombol ini tetap bisa diklik bebas */
        className="absolute left-0 pointer-events-auto flex h-24 w-6 items-center justify-center rounded-r-xl bg-[#040e1a] border border-l-0 border-cyan-800 text-cyan-500 hover:text-orange-400 hover:bg-cyan-900/80 transition-all duration-300 shadow-[4px_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
        title="Buka/Tutup Panel"
      >
        {state === "expanded" ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}