// app/customer/dashboard/page.tsx
import { Suspense } from "react";
import MarketExplorationContent from "@/components/market-content";

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#010812] text-xs text-cyan-400 font-mono tracking-widest animate-pulse">
          LOADING DASHBOARD SYSTEM...
        </div>
      }
    >
      <MarketExplorationContent />
    </Suspense>
  );
}