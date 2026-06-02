import React from "react";
import { cookies } from "next/headers";
import Link from "next/link"; 
import { Users, Store, Box, Receipt } from "lucide-react";

// ==========================================
// 1. ANOTASI TIPE DATA (TYPE DEFINITION)
// ==========================================
type UniversalResponse = {
  success?: boolean;
  meta?: {
    total: number;
  };
  data?: Record<string, unknown>[];
} | Record<string, unknown>[];

// ==========================================
// 2. FUNGSI LOGIKA (BACKEND FETCHING)
// ==========================================
async function getTotalCount(endpoint: string, token: string): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/${endpoint}?page=1&limit=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", 
    });

    if (!response.ok) return 0;
    
    const resData: UniversalResponse = await response.json();

    if ('meta' in resData && resData.meta?.total !== undefined) {
      return resData.meta.total;
    }
    if ('data' in resData && Array.isArray(resData.data)) {
      return resData.data.length; 
    }
    if (Array.isArray(resData)) {
      return resData.length;
    }

    return 0;
  } catch (error) {
    console.error(`failed to fetch ${endpoint}:`, error);
    return 0;
  }
}

// ==========================================
// 3. KOMPONEN UTAMA PAGE (SERVER COMPONENT)
// ==========================================
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const [totalCustomers, totalSellers, totalProducts, totalTransactions] = await Promise.all([
    getTotalCount("customer", token),
    getTotalCount("seller", token),
    getTotalCount("product", token),
    getTotalCount("transaction", token), 
  ]);

  const stats = [
    { 
      title: "Total Pelanggan", 
      value: totalCustomers.toLocaleString("id-ID"), 
      unit: "CUSTOMERS",
      icon: Users, 
      color: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]", 
      borderColor: "group-hover:border-cyan-400/60",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
      path: "/admin/customers" 
    },
    { 
      title: "Mitra Penjual", 
      value: totalSellers.toLocaleString("id-ID"), 
      unit: "SELLERS",
      icon: Store, 
      color: "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]", 
      borderColor: "group-hover:border-orange-500/60",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
      path: "/admin/sellers" 
    },
    { 
      title: "Total Produk", 
      value: totalProducts.toLocaleString("id-ID"), 
      unit: "PRODUCTS",
      icon: Box, 
      color: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]", 
      borderColor: "group-hover:border-emerald-400/60",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
      path: "/admin/products" 
    },
    { 
      title: "Total Transaksi", 
      value: totalTransactions.toLocaleString("id-ID"), 
      unit: "TRANSACTIONS",
      icon: Receipt, 
      color: "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]", 
      borderColor: "group-hover:border-amber-500/60",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      path: "/admin/transactions" 
    },
  ];

  return (
    <div className="space-y-10 font-mono text-cyan-100 p-2">
      
      {/* HEADER UTAMA BERGAYA ANTARMUKA KONSOL PDA */}
      <div className="relative border-b border-cyan-950/80 pb-5 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-0.5 before:bg-orange-500">
        <div className="flex justify-between items-center text-[10px] tracking-widest text-cyan-500/50 font-bold mb-2">
          <span>PAGE // ADMIN DASHBOARD</span>
          <span className="text-emerald-400 animate-pulse">● ONLINE</span>
        </div>
        <h2 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          ADMIN DASHBOARD
        </h2>
        <p className="text-cyan-500/70 text-xs mt-1 uppercase tracking-wider font-bold">
          Monitor real-time statistics, manage platform-wide data, and oversee all marketplace operations from a centralized command interface.
        </p>
      </div>

      {/* MONITORING SYSTEM: GRID KARTU TAKTIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link 
            href={stat.path} 
            key={idx}
            className="block group select-none" 
          >
            {/* WADAH UTAMA KARTU (INDUSTRIAL INTERFACE FRAME)
              - Menggunakan pemotongan sudut melintang tajam khas sci-fi (rounded-tl-2xl & rounded-br-2xl)
              - Border kiri oranye statis sebagai aksen identitas faksi Alterra
            */}
            <div 
              className={`relative bg-[#031224]/80 backdrop-blur-xl border border-cyan-900/60 p-6 rounded-br-2xl rounded-tl-2xl flex items-center gap-5 transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500/80 hover:bg-[#041930]/90 ${stat.borderColor} ${stat.glowColor} hover:-translate-y-1`}
            >
              {/* INDIKATOR SUDUT SEKERUP DEKORATIF LABIRIN TEKNOLOGI */}
              <div className="absolute top-1 right-2 text-[8px] text-cyan-950 font-black group-hover:text-cyan-700 transition-colors">
                [0{idx + 1}]
              </div>

              {/* KOTAK INDIKATOR IKON (SECTOR MODULE MODULE) */}
              <div className={`p-3.5 rounded bg-[#010912] border border-cyan-950 group-hover:border-cyan-800 transition-all ${stat.color}`}>
                <stat.icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              
              {/* PANEL METRIK DATA */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black tracking-[0.15em] uppercase text-cyan-600 group-hover:text-cyan-400 transition-colors truncate">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <h3 className="text-2xl font-black text-white tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                    {stat.value}
                  </h3>
                  <span className="text-[8px] font-black text-cyan-700 uppercase tracking-widest group-hover:text-cyan-500 transition-colors">
                    {stat.unit}
                  </span>
                </div>
              </div>

              {/* AKKSEN MEKANIK SEKERUP SUDUT BAWAH */}
              <div className="absolute bottom-1 right-1.5 w-1 h-1 bg-cyan-900/50 rounded-full" />
            </div>
          </Link>
        ))}
      </div>

      {/* PANEL NOTIFIKASI TERMINAL DIAGNOSTIK BAWAH */}
      <div className="relative p-4 bg-[#010710]/90 border border-cyan-950/60 rounded text-[11px] text-cyan-600 flex justify-between items-center select-none">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold tracking-wider uppercase">ALL SYSTEMS ONLINE: DATA IS AUTOMATICALLY UPDATED</span>
        </div>
      </div>

    </div>
  );
}

export const dynamic = "force-dynamic";