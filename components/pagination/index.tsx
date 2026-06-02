"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Membuat array angka halaman (misal: [1, 2, 3])
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Fungsi navigasi halaman menggunakan URL Search Params
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString()); // Update query param ?page=
    
    // Dorong parameter baru ke URL agar Server Component melakukan fetch data ulang
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold tracking-wide text-cyan-500/80">
      <div>
        Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
      </div>

      <div className="flex items-center gap-2">
        {/* Tombol Sebelumnya */}
        <button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-[#061d2f] border border-[#1ca3c4]/30 rounded text-cyan-400 hover:bg-[#1ca3c4]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Sebelumnya
        </button>

        {/* Angka Halaman di Tengah */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white font-bold shadow-[0_0_10px_rgba(230,92,0,0.3)]"
                  : "bg-[#061d2f] border-[#1ca3c4]/20 text-cyan-400 hover:border-[#1ca3c4]/60"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Tombol Selanjutnya */}
        <button
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-[#061d2f] border border-[#1ca3c4]/30 rounded text-cyan-400 hover:bg-[#1ca3c4]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}