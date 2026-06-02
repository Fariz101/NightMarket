// components/transaction-status-filter.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function TransactionStatusFilter({ status }: { status: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset ke halaman 1 ketika filter berubah
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={status || "ALL"}
      onChange={(e) => handleStatusChange(e.target.value)}
      className="bg-[#061d2f] border border-[#1ca3c4]/30 text-xs font-bold text-cyan-400 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1ca3c4] transition-all cursor-pointer min-w-[150px]"
    >
      <option value="ALL">🌐 ALL</option>
      <option value="PENDING">⏳ PENDING</option>
      <option value="APPROVED">✅ APPROVED</option>
      <option value="REJECTED">❌ REJECTED</option>
    </select>
  );
}