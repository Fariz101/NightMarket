/* eslint-disable @next/next/no-img-element */
// components/receipt-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Transaction = {
  id: number | string;
  totalPrice: number;
  status: string;
  paymentProof?: string;
  createdAt: string;
  customer?: { 
    name: string;
    phone?: string;
    user?: { email: string };
  };
};

export default function ReceiptModal({ transaction }: { transaction: Transaction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Memastikan Portal hanya dieksekusi di sisi Client (Browser)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Mencegah scrolling pada background utama saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const customerPhone = transaction.customer?.phone || "Tidak ada nomor telepon";
  
  const formattedDate = transaction.createdAt 
    ? new Date(transaction.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("id-ID");

  // Fungsi print window terisolasi untuk hasil PDF yang bersih
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk_Transaksi_${transaction.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght=400;700&display=swap');
            body { font-family: 'Courier Prime', monospace; background-color: #ffffff; color: #000000; }
          </style>
        </head>
        <body class="p-8 max-w-xl mx-auto">
          <div class="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <h1 class="text-2xl font-bold tracking-widest text-gray-900">NMARKET SYSTEM</h1>
            <p class="text-xs text-gray-600 mt-1">Struk Bukti Pembayaran Operasional</p>
          </div>
          
          <div class="space-y-2 text-xs border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <div class="flex justify-between"><span>ID TRANSAKSI:</span><span class="font-bold">#${transaction.id}</span></div>
            <div class="flex justify-between"><span>TANGGAL   :</span><span>${formattedDate}</span></div>
            <div class="flex justify-between"><span>PELANGGAN :</span><span class="uppercase">${transaction.customer?.name || "Customer"}</span></div>
            <div class="flex justify-between"><span>NOMOR TELEPON   :</span><span>${customerPhone}</span></div>
          </div>

          <div class="space-y-3 text-xs border-b-2 border-dashed border-gray-400 pb-4 mb-4">
            <div class="flex justify-between font-bold text-sm">
              <span>TOTAL HARGA</span>
              <span>${formatRupiah(transaction.totalPrice)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>STATUS OPERASIONAL</span>
              <span class="px-2 py-0.5 border border-black font-bold text-[10px]">${transaction.status}</span>
            </div>
          </div>

          ${transaction.paymentProof ? `
            <div class="mt-4">
              <p class="text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-wider">⚡ Lampiran Bukti Transfer:</p>
              <div class="border border-gray-300 p-1 rounded max-w-xs mx-auto">
                <img src="${transaction.paymentProof}" class="w-full h-auto object-contain max-h-[350px]" alt="Bukti Transfer" />
              </div>
            </div>
          ` : ""}

          <div class="text-center mt-8 pt-4 border-t border-gray-300">
            <p class="text-[10px] text-gray-500 italic">Terima kasih atas kepercayaan Anda. Dokumen sah diproses oleh NMarket System.</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Kerangka Modal DOM yang dilempar ke Portal body
  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* 1. Backdrop Blur Overlay (Klik di luar modal untuk menutup) */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Box Content Modal (Tepat di tengah layar) */}
      <div className="relative bg-[#061d2f] border border-[#1ca3c4]/40 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10 scale-100 transition-all animate-zoom-in">
        
        {/* Header Modal */}
        <div className="p-4 bg-[#03101a] border-b border-[#1ca3c4]/20 flex justify-between items-center">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            PREVIEW STRUK PEMBAYARAN
          </span>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors text-base font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Konten Desain Struk */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div className="text-center border-b border-dashed border-cyan-800/60 pb-4">
            <h3 className="text-lg font-black text-white tracking-wider">NMARKET RECEIPT</h3>
            <p className="text-[10px] text-cyan-400 mt-0.5">ID: #{transaction.id}</p>
          </div>

          <div className="space-y-2 bg-[#03101a]/60 p-3 rounded border border-cyan-900/40 text-cyan-100">
            <div className="flex justify-between">
              <span className="text-cyan-500">Pelanggan:</span>
              <span className="font-bold">{transaction.customer?.name || "Customer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">Nomor Telepon:</span>
              <span className="truncate max-w-55">{customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">Waktu Masuk:</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-2.5 px-3 bg-emerald-950/20 border border-emerald-800/30 rounded text-emerald-400 font-bold">
            <span>TOTAL TRANSAKSI</span>
            <span className="text-sm">{formatRupiah(transaction.totalPrice)}</span>
          </div>

          {transaction.paymentProof && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-orange-400 uppercase block">Lampiran Bukti Gambar:</span>
              <div className="bg-[#03101a] border border-cyan-900/40 rounded p-2 flex justify-center bg-cyan-950/20">
                <img 
                  src={transaction.paymentProof} 
                  alt="Bukti Transfer Pelanggan" 
                  className="max-h-52 object-contain rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="p-4 bg-[#03101a] border-t border-[#1ca3c4]/20 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-all font-semibold"
          >
            Kembali
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded text-xs shadow-lg transition-all flex items-center gap-1.5"
          >
            <span>🖨️</span> Cetak / Export PDF
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-orange-400 underline font-bold hover:text-orange-300 transition-colors text-left block text-[11px]"
      >
        🧾 Lihat Struk
      </button>

      {/* Render menggunakan React Portal ke document.body jika state open bernilai true */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}