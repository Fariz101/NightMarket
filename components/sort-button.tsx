"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SortButtonProps {
  columnKey: string; // Kolom yang di-sort (contoh: 'name', 'username', 'email')
}

export default function SortButton({ columnKey }: SortButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") || "";
  const currentSortOrder = searchParams.get("sortOrder") || "";

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentSortBy === columnKey) {
      if (currentSortOrder === "asc") {
        params.set("sortOrder", "desc");
      } else if (currentSortOrder === "desc") {
        // Jika diklik ketiga kalinya, hapus sort (kembali ke default)
        params.delete("sortBy");
        params.delete("sortOrder");
      }
    } else {
      // Jika kolom baru diklik, set menjadi ASC
      params.set("sortBy", columnKey);
      params.set("sortOrder", "asc");
    }

    router.push(`?${params.toString()}`);
  };

  // Logika tampilan ikon panah
  let icon = "⇅";
  if (currentSortBy === columnKey) {
    icon = currentSortOrder === "asc" ? "▲" : "▼";
  }

  return (
    <button
      onClick={handleSort}
      className={`ml-1 px-1 rounded hover:bg-cyan-500/20 transition-colors text-[10px] font-mono ${
        currentSortBy === columnKey ? "text-orange-500 font-bold" : "text-cyan-600"
      }`}
      title={`Urutkan berdasarkan ${columnKey}`}
    >
      {icon}
    </button>
  );
}