/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";

// 🌟 IMPORT LANGSUNG DARI FILE types.ts
import { Customer, CartItem } from "../types"; 

// ========================================================
// 1. HELPER FUNCTIONS (COOKIES MANAGEMENT)
// ========================================================
function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

function deleteClientCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // ========================================================
  // 2. STATES MANAGEMENT
  // ========================================================
  const [mounted, setMounted] = useState(false);
const [searchValue, setSearchValue] = useState("");
  const [profile, setProfile] = useState<Customer | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // ========================================================
  // 3. BACKEND API FETCHING (DATA DATA LOGIC)
  // ========================================================
  const fetchCartData = async () => {
    const token = getClientCookie("token");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok && resData.data) {
        setCart(resData.data);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Gagal memuat keranjang:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const token = getClientCookie("token");
    
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((resData) => {
          const dataUser = resData?.data || resData;
          if (dataUser) {
            setProfile(dataUser as Customer);
          }
        })
        .catch((err) => console.error("Gagal memuat profil:", err));
    }

    fetchCartData();
    
    window.addEventListener("cart_updated", fetchCartData);
    const handleOpenCartTrigger = () => setIsCartOpen(true);
    window.addEventListener("trigger_cart_open", handleOpenCartTrigger);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("cart_updated", fetchCartData);
      window.removeEventListener("trigger_cart_open", handleOpenCartTrigger);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========================================================
  // 4. HANDLER LOGIC INTERACTION
  // ========================================================
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("search", val);
    else params.delete("search");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin Logout?")) {
      deleteClientCookie("token");
      router.push("/");
    }
  };

  const updateCartQuantity = async (cartItemId: number, currentAmount: number, change: number, maxStock: number) => {
    const newAmount = currentAmount + change;
    const token = getClientCookie("token");
    
    try {
      if (newAmount > maxStock) return alert("Stok maksimal tercapai!");
      
      if (newAmount <= 0) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/cart/${cartItemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/cart/${cartItemId}`, {
          method: "PATCH",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ amount: newAmount })
        });
      }
      fetchCartData();
    } catch (error) {
      console.error("Gagal memperbarui kuantitas barang:", error);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.amount, 0);
  const totalCartPrice = useMemo(() => cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.amount, 0), [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const token = getClientCookie("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/transaction/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();

      if (response.ok && result.success) {
        alert("Checkout Sukses! Silakan cek Log Riwayat untuk upload bukti pembayaran.");
        setIsCartOpen(false);
        fetchCartData(); 
        window.dispatchEvent(new Event("transaction_success")); 
      } else {
        alert(`Gagal Checkout: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem saat checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020a14] flex flex-col font-mono text-white relative selection:bg-cyan-500 selection:text-black">
      
      {/* BACKGROUND GRAPHIC ACCENTS (SUBNAUTICA THEME GRID) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-75 bg-linear-to-b from-cyan-950/20 to-transparent pointer-events-none z-0" />

      {/* DESIGN: HIGH-TECH NAVIGATION NAVBAR */}
      <header className="w-full bg-[#020e1a]/90 backdrop-blur-md border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between z-40 sticky top-0 select-none shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        
        {/* DESIGN: BRANDING LOGO */}
        <div className="flex items-center gap-2 group">
          <span className="text-4xl font-black tracking-widest text-white cursor-pointer transition-transform duration-200 active:scale-95" onClick={() => router.push('/customer/dashboard')}>
            <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">N</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] group-hover:text-white transition-colors">MARKET</span>
          </span>
          
          
        </div>

        {/* DESIGN: GLOBAL SCI-FI SEARCH BAR */}
        <div className="flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="SEARCH FOR PRODUCT..."
            className="w-full bg-[#010811] border border-cyan-500/30 text-cyan-300 placeholder-cyan-800 rounded-tl-xl rounded-br-xl pl-9 pr-4 py-2 text-xs font-bold uppercase focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300"
          />
          <span className="absolute left-3 top-2 text-cyan-600/80 text-[11px] animate-pulse">🔍</span>
        </div>

        {/* DESIGN: HUB SYSTEM CONTROLS */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          
          {/* CART INTERACTION BUTTON */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 border-t border-b border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-500/20 text-cyan-400 font-black rounded-tl-lg rounded-br-lg text-xs uppercase tracking-widest transition-all duration-200 flex items-center gap-2.5 cursor-pointer hover:text-white"
          >
            <span>🛒 YOUR CART</span>
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-tl rounded-br text-[9px] font-black shadow-[0_0_8px_rgba(249,115,22,0.5)]">
              {cartCount}
            </span>
          </button>

          {/* USER PROFILE CONSOLE TRIGGER */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-tl-xl rounded-br-xl bg-linear-to-br from-cyan-500 via-cyan-950 to-orange-500 p-[1.5px] overflow-hidden focus:outline-none active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-lg hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            {profile?.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover rounded-tl-[10px] rounded-br-[10px] bg-[#020e1a]" />
            ) : (
              <div className="w-full h-full rounded-tl-[10px] rounded-br-[10px] bg-[#010811] flex items-center justify-center text-cyan-400 text-[10px] font-black uppercase tracking-tighter">
                {profile?.name ? profile.name.slice(0, 2) : "US"}
              </div>
            )}
          </button>

          {/* DESIGN: DROPDOWN INTERFACE OPERATOR */}
          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-64 bg-[#030f1b] border border-cyan-500/40 rounded-tl-xl rounded-br-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-150">
              
              {/* TOP HEADER DETAILS */}
              <div className="p-4 bg-[#020a14] border-b border-cyan-500/20 flex flex-col relative">
                <div className="absolute top-2 right-2 text-[7px] font-black text-cyan-600/80 tracking-widest uppercase">ID: {profile?.id}</div>
                <span className="text-xs font-black text-white uppercase tracking-wide truncate">{profile?.name || "-"}</span>
                <span className="text-[9px] text-cyan-500 font-mono mt-1 truncate/60">✉ {profile?.user?.email || "-"}</span>
                <span className="text-[9px] text-cyan-500 font-mono mt-0.5 truncate/60">📞 {profile?.phone || "-"}</span>
                <span className="text-[9px] text-cyan-500 font-mono mt-0.5 truncate/60">📍 {profile?.address || "-"}</span>
              </div>
              
              {/* NAVIGATION ACTION MATRIX */}
              <div className="flex flex-col p-1.5 bg-[#030e1a]">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-950/40 rounded transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* DYNAMIC SLOT CONTENT INJECTION */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* ========================================================
        5. PORTAL CORE DRAWER: STORAGE POOL DETAILED CONSOLE
        ======================================================== */}
      {mounted && isCartOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-9999 flex justify-end animate-in fade-in duration-200">
          
          {/* SLIM HIGH-TECH PANEL FRAME */}
          <div className="bg-[#020e1a]/95 border-l border-cyan-500/30 w-full max-w-sm h-full flex flex-col text-white font-mono shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* DRAWER TOP HUB */}
            <div className="p-4 bg-[#031526] border-b border-cyan-500/20 flex justify-between items-center">
              <div>
                <span className="text-[8px] font-black text-cyan-500 tracking-widest block uppercase">Cart Inventory Manager</span>
                <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">🛒 Your cart</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="w-7 h-7 flex items-center justify-center border border-cyan-500/30 rounded bg-[#010a14] text-cyan-400 hover:text-white hover:border-cyan-400 transition-all font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* DYNAMIC SCROLLABLE LIST COMPONENT */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-24 text-cyan-700/60 text-xs font-black uppercase tracking-widest animate-pulse">
                  Cart is empty.<br />no products added to cart.
                </div>
              ) : (
                cart.map((item, idx) => (
                  /* HIGH TECH MATRIC MATERIAL CARD */
                  <div key={item.id || `c-${idx}`} className="bg-[#010812] border border-cyan-500/20 p-3 rounded-tl-xl rounded-br-xl flex justify-between items-center gap-3 hover:border-cyan-500/40 transition-colors shadow-md">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-black text-white truncate text-xs uppercase tracking-wide">{item.product?.name || "Asset"}</h5>
                      <p className="text-orange-400 text-[10px] font-bold mt-0.5">Rp {(item.product?.price || 0).toLocaleString("id-ID")}</p>
                    </div>
                    
                    {/* QUANTITY CONSOLE CONTROLLERS */}
                    <div className="flex items-center gap-1.5 bg-[#020e1a] border border-cyan-950 p-1 rounded-tl-md rounded-br-md">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.amount, -1, item.product?.stock || 0)} 
                        className="w-5 h-5 flex items-center justify-center bg-[#01070f] border border-cyan-900 text-cyan-400 font-black text-xs rounded hover:text-white hover:border-cyan-500 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-1.5 text-white text-xs font-black min-w-5 text-center">{item.amount}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.amount, 1, item.product?.stock || 0)} 
                        className="w-5 h-5 flex items-center justify-center bg-[#01070f] border border-cyan-900 text-cyan-400 font-black text-xs rounded hover:text-white hover:border-cyan-500 transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* INVENTORY CONTROL CALCULATORS */}
            {cart.length > 0 && (
              <div className="p-4 bg-[#020a14] border-t border-cyan-500/20 space-y-4">
                <div className="flex justify-between items-center text-xs bg-[#010812] p-3 rounded border border-cyan-950">
                  <span className="text-cyan-500 font-black uppercase tracking-widest text-[8px]">TOTAL COST</span>
                  <span className="text-orange-400 font-black text-sm tracking-wide">Rp {totalCartPrice.toLocaleString("id-ID")}</span>
                </div>
                
                {/* SUBMIT ORDER FABRICATOR BUTTON */}
                <button 
                  onClick={handleCheckout} 
                  disabled={checkoutLoading} 
                  className="w-full py-3 relative overflow-hidden bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:from-orange-950 disabled:to-slate-900 disabled:opacity-40 text-white font-black rounded-tl-xl rounded-br-xl uppercase tracking-widest text-xs cursor-pointer transition-all shadow-[0_4px_20px_rgba(249,115,22,0.2)]"
                >
                  {checkoutLoading ? "CREATING TRANSACTION..." : "CHECK OUT"}
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}