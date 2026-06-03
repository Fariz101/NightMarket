import React from "react";
import { cookies } from "next/headers";
import StatusDropdown from "./status";
import Search from "@/components/search";
import TransactionStatusFilter from "@/components/status-filter";
import Pagination from "@/components/pagination";
import SortButton from "@/components/sort-button";
import ReceiptModal from "@/components/receipt";

type Transaction = {
  id: number | string;
  totalPrice: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  paymentProof?: string;
  createdAt: string;
  customerId?: number;
  customer?: {
    name: string;
    phone?: string;
    user?: {
      username: string;
      email: string;
    };
  };
};

async function getTransactions(token: string): Promise<Transaction[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/transaction`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseData = await response.json();

    // 🔴 PERBAIKAN DI SINI: Pastikan kita mengambil array dari responseData.data
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }

    return [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

type Props = {
  searchParams: Promise<{
    page?: string | number;
    limit?: string | number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function TransactionsPage(prop: Props) {
  const resolvedSearchParams = await prop.searchParams;

  const page = Number(resolvedSearchParams?.page) || 1;
  // Kita sesuaikan limit bawaan menjadi 6 agar seimbang saat dibagi ke layout grid 3 kolom
  const limit = Number(resolvedSearchParams?.limit) || 6; 
  const search = resolvedSearchParams?.search || "";
  const status = resolvedSearchParams?.status || "";
  const sortBy = resolvedSearchParams?.sortBy || "id";
  const sortOrder = resolvedSearchParams?.sortOrder || "desc";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const rawTransactions = await getTransactions(token);

  // ⚙️ FRONTEND PROCESSING
  let processedData = [...rawTransactions];

  if (search) {
    processedData = processedData.filter((tx) => {
      const customerName = tx.customer?.name || `ID Pelanggan: ${tx.customerId}`;
      return (
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        String(tx.id).includes(search)
      );
    });
  }

  if (status && status !== "ALL") {
    processedData = processedData.filter((tx) => tx.status === status);
  }

  processedData.sort((a, b) => {
    if (sortBy === "customerName") {
      const nameA = a.customer?.name || `ID Pelanggan: ${a.customerId}`;
      const nameB = b.customer?.name || `ID Pelanggan: ${b.customerId}`;
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === "totalPrice") {
      return sortOrder === "asc" ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
    } else {
      return sortOrder === "asc" ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id);
    }
  });

  const totalCount = processedData.length;
  const startIndex = (page - 1) * limit;
  const displayedTransactions = processedData.slice(startIndex, startIndex + limit);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 bg-[#010a15]/30 min-h-screen text-white font-mono space-y-8">
      {/* HEADER PANEL BERGAYA CONSOLE DATA ARCHIVE */}
      <div className="relative bg-[#031224]/80 backdrop-blur-xl border border-cyan-900/60 p-6 rounded-br-2xl rounded-tl-2xl border-l-4 border-l-orange-500 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
        <div className="flex justify-between items-center text-[9px] tracking-widest text-cyan-500/50 font-black mb-1">
          <span>PAGE // TRANSACTIONS DATA</span>
          <span>DATA COUNT: {totalCount} TRANSACTIONS</span>
        </div>
        <h4 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          TRANSACTIONS DATA
        </h4>
        <p className="text-xs text-cyan-500/70 mt-1 uppercase font-bold tracking-wide">
         Monitor transactions, view payment proof, and change transaction&apos;s status.
        </p>

        {/* UTILITY CONTROL BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-[#010912]/80 p-3 rounded border border-cyan-950">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl grow">
            <Search search={search} placeholder="SEARCH TRANSACTIONS..." />
            <TransactionStatusFilter status={status} />
          </div>
          
          {/* SORT BUTTON STRIP UTK CARD GRID */}
          <div className="flex items-center gap-2 bg-[#01070e] px-3 py-1.5 rounded border border-cyan-900/40 text-[10px] font-black text-cyan-400">
            <span className="text-cyan-600">SORT BY:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 border-r border-cyan-950 pr-2">
                CUSTOMER <SortButton columnKey="customerName" />
              </span>
              <span className="flex items-center gap-1">
                PRICE <SortButton columnKey="totalPrice" />
              </span>
            </div>
          </div>
        </div>

        {/* DATA GRID AREA (3 KOLOM SEPERTI SUBNAUTICA) */}
        {displayedTransactions.length === 0 ? (
          <div className="mt-6 p-12 border border-dashed border-red-500/30 rounded bg-red-950/10 text-center text-red-400 text-xs uppercase tracking-[0.2em] font-black">
            TRANSACTIONS DOES NOT EXIST
          </div>
        ) : (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTransactions.map((tx) => {
                const customerPhone = tx.customer?.phone || "No registered telemetry data";
                
                // Kalkulasi warna badge status murni estetik luar card
                const statusBorder = 
                  tx.status === "APPROVED" ? "hover:border-emerald-500" :
                  tx.status === "REJECTED" ? "hover:border-red-500" : "hover:border-amber-500";

                return (
                  <div
                    key={tx.id}
                    className={`flex flex-col justify-between bg-[#020b17]/90 border border-cyan-900/50 rounded-br-2xl rounded-tl-2xl overflow-hidden group transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative ${statusBorder}`}
                  >
                    {/* ID Floating Badge */}
                    <div className="absolute top-2 right-3 z-10 bg-cyan-950/90 border border-cyan-800/60 px-2 py-0.5 rounded text-[9px] font-black text-cyan-400 tracking-wider">
                      TX-{tx.id}
                    </div>

                    {/* UPPER SECTION: SENDER DETAILS */}
                    <div className="p-4 bg-[#010811]/60 border-b border-cyan-950/80 relative">
                      <span className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest block mb-0.5">
                        TRANSACTION
                      </span>
                      <h5 className="font-black text-white text-sm tracking-wide uppercase truncate">
                        {tx.customer?.name || `ID CUSTOMER: ${tx.customerId}`}
                      </h5>
                      <p className="text-[10px] text-cyan-400/70 truncate font-mono mt-0.5">
                        📱 {customerPhone}
                      </p>
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(6,182,212,0.03)_50%,transparent_55%)] bg-size-[100%_6px] pointer-events-none" />
                    </div>

                    {/* MIDDLE SECTION: TRANSACTION TELEMETRY */}
                    <div className="p-4 space-y-4 grow">
                      {/* Nilai Transaksi */}
                      <div className="bg-[#01070e] p-3 rounded border border-cyan-950/60">
                        <span className="text-cyan-600/60 block text-[8px] font-black tracking-wider uppercase">
                          TOTAL PRICE
                        </span>
                        <span className="font-bold text-emerald-400 tracking-wider text-base">
                          {formatRupiah(tx.totalPrice)}
                        </span>
                      </div>

                      {/* Bukti Bayar Component Area */}
                      <div className="flex flex-col bg-[#01070e]/40 p-2.5 rounded border border-cyan-950/40 text-[11px] gap-1.5">
                        <span className="text-cyan-600/60 text-[8px] font-black tracking-wider uppercase">
                          PAYMENT PROOF
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px]"></span>
                          {tx.paymentProof ? (
                            <div className="text-cyan-400 hover:text-cyan-300 font-bold transition-all underline decoration-cyan-900">
                              <ReceiptModal transaction={tx} />
                            </div>
                          ) : (
                            <span className="text-red-400/60 italic font-medium text-[10px] uppercase tracking-wide">
                              No digital receipt compiled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* LOWER SECTION: STATUS DROPDOWN CONTROLLER */}
                    <div className="p-3 bg-[#010912] border-t border-cyan-950 flex flex-col gap-1.5">
                      <span className="text-cyan-600/60 text-[8px] font-black tracking-wider uppercase px-0.5">
                        TRANSACTION STATUS
                      </span>
                      <div className="w-full">
                        <StatusDropdown
                          transactionId={tx.id}
                          currentStatus={tx.status}
                          token={token}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* TELEMETRY PACKET PAGINATION FOOTER */}
            <div className="mt-6 bg-[#01070e] p-4 rounded-bl-xl rounded-tr-xl border border-cyan-950 flex justify-between items-center flex-wrap gap-3 text-[11px] text-cyan-600 font-bold">
              <div>
                <Pagination
                  currentPage={page}
                  totalItems={totalCount}
                  itemsPerPage={limit}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";