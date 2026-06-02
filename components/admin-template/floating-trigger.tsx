"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FloatingTrigger() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 flex items-center w-0 h-screen z-50 pointer-events-none font-mono">
      <button
        onClick={toggleSidebar}
        className="absolute left-0 pointer-events-auto flex h-28 w-5 items-center justify-center rounded-r-md bg-[#031122] border-2 border-l-0 border-cyan-500/30 text-cyan-400 hover:text-orange-400 hover:bg-[#051c36] hover:border-cyan-400 transition-all duration-300 shadow-[5px_0_20px_rgba(0,0,0,0.6)] cursor-pointer group"
        title="Buka/Tutup Sub-Sistem Panel"
      >
        {/* Garis aksen vertikal tipis industrial di sisi tombol */}
        <div className="absolute right-[2px] top-2 bottom-2 w-[1px] bg-cyan-950 group-hover:bg-cyan-800 transition-colors" />
        
        {state === "expanded" ? (
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        ) : (
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 animate-pulse" />
        )}
      </button>
    </div>
  );
}