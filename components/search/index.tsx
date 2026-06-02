"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search as SearchIcon } from "lucide-react"; // Menggunakan ikon kaca pembesar dari Lucide

interface SearchProps {
  search: string;
  placeholder?: string; // 💡 Props opsional agar teks placeholder bisa diganti-ganti
}

export default function Search({ search, placeholder = "Search admin by name..." }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Jika ada teks pencarian, set ke query params URL, jika kosong hapus param 'search'
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    
    // Reset halaman kembali ke page 1 setiap kali user melakukan pencarian baru
    params.set("page", "1");

    // Lakukan navigasi URL secara halus di Next.js Client Component
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full group">
      {/* Ikon Kaca Pembesar Sonar Cyan */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-600 group-focus-within:text-orange-500 transition-colors">
        <SearchIcon className="w-4 h-4" />
      </div>
      
      {/* Input Field Data */}
      <input
        type="text"
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder} // 💡 Menggunakan nilai placeholder dinamis
        className="w-full bg-[#03101a] border border-[#1ca3c4]/40 text-cyan-100 placeholder-cyan-700/60 rounded-md p-2 pl-9 text-xs font-mono focus:outline-none focus:border-orange-500/80 focus:shadow-[0_0_10px_rgba(255,140,0,0.2)] transition-all"
      />
    </div>
  );
}