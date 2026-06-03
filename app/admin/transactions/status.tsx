"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type DropdownProps = {
  transactionId: string | number;
  currentStatus: string;
  token: string;
};

export default function StatusDropdown({ transactionId, currentStatus, token }: DropdownProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setStatus(newStatus);

    try {
      // PENYESUAIAN ENDPOINT: Menyesuaikan route path parameter dinamis backend /transaction/:id/status
      const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/transaction/${transactionId}/status`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus, // Mengirim status valid: PENDING, APPROVED, atau REJECTED
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`Gagal memperbarui status transaksi: ${result.message}`);
        setStatus(currentStatus); // Rollback pilihan visual jika backend menolak
      } else {
        router.refresh(); // Segarkan muatan data server component
      }
    } catch (error) {
      console.error("Patch connection error:", error);
      alert("Terjadi keslahan saat memperbarui status transaksi");
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStyleByStatus = (val: string) => {
  switch (val.toUpperCase()) {
    case "APPROVED":
      return "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 focus:border-emerald-500";
    case "PENDING":
      return "bg-amber-950/40 text-amber-400 border-amber-500/30 focus:border-amber-500";
    case "REJECTED":
      return "bg-red-950/40 text-red-400 border-red-500/30 focus:border-red-500";
    default:
      return "bg-slate-900 text-gray-400 border-slate-700";
  }
};

  return (
    <div className="relative inline-block w-full">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`w-full px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer bg-[#03101a] outline-none ${getStyleByStatus(
          status
        )} ${loading ? "opacity-30 cursor-not-allowed" : "hover:border-orange-500/70"}`}
      >
        <option value="PENDING" className="bg-[#061d2f] text-amber-400">⏳ PENDING</option>
        <option value="APPROVED" className="bg-[#061d2f] text-emerald-400">✅ APPROVED</option>
        <option value="REJECTED" className="bg-[#061d2f] text-red-400">❌ REJECTED</option>
      </select>
    </div>
  );
}