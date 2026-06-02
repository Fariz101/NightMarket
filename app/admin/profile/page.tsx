/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { Admin } from "@/app/types"; 

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function AdminProfilePage() {
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getClientCookie("token");

    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/admin/me`, {
        method: "GET",
        headers: {
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal memuat profil admin");
          return res.json();
        })
        .then((resData) => {
          const dataAdmin = resData?.data || resData;
          if (dataAdmin) {
            setAdminData(dataAdmin as Admin);
          }
        })
        .catch((err) => {
          console.error("Error Fetch Profil Admin:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 font-mono mt-20">
        <div className="text-center text-cyan-400 font-bold animate-pulse text-xs tracking-[0.2em] uppercase">
          LOADING...
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 font-mono mt-20 p-4">
        <div className="bg-[#120404]/90 backdrop-blur-xl border-2 border-red-500/30 p-8 rounded-br-2xl rounded-tl-2xl text-center text-red-400 text-xs tracking-wider uppercase font-black shadow-[0_0_30px_rgba(239,68,68,0.1)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-red-500">
          error: failed to load admin profile.
        </div>
      </div>
    );
  }

  const adminPhoto = adminData.photo;
  const initial = adminData.name ? adminData.name.charAt(0).toUpperCase() : "A";

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-mono text-cyan-100 p-2">
      
      {/* HEADER SECTION */}
      <div className="relative border-b border-cyan-950/80 pb-5 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-12 before:h-0.5 before:bg-orange-500">
        <div className="flex justify-between items-center text-[10px] tracking-widest text-cyan-500/50 font-bold mb-2">
          <span>PAGE // ADMIN PROFILE</span>
          <span className="text-orange-400">ROLE: ADMIN</span>
        </div>
        <h2 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          ADMIN PROFILE
        </h2>
        <p className="text-cyan-500/70 text-xs mt-1 uppercase tracking-wider font-bold">
          View your admin profile information.
        </p>
      </div>

      {/* DETAILED DATA CONTAINER */}
      <div className="relative bg-[#031224]/85 backdrop-blur-xl border-2 border-cyan-500/20 p-8 rounded-br-3xl rounded-tl-3xl shadow-[0_0_40px_rgba(6,182,212,0.1)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-5 before:h-5 before:border-t-4 before:border-l-4 before:border-orange-500 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-5 Grounded after:h-5 after:border-b-4 after:border-r-4 after:border-orange-500">
        
        {/* AVATAR DUAL BIOMETRIC DISPLAY */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-cyan-950/60 relative">
          
          {/* Bingkai Pemindai Faset (Faceted Biometric Frame) */}
          <div className="relative w-28 h-28 rounded-br-xl rounded-tl-xl bg-[#010912] border-2 border-cyan-500/40 flex items-center justify-center overflow-hidden p-1 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0 group">
            
            {/* Garis pemindai HUD fiksi ilmiah hiasan */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(6,182,212,0.2)_50%,transparent_55%)] bg-size-[100%_8px] opacity-40 pointer-events-none z-10" />
            
            <div className="w-full h-full rounded-br-lg rounded-tl-lg overflow-hidden bg-cyan-950/30 flex items-center justify-center border border-cyan-900/40 relative">
              {adminPhoto ? (
                <img 
                  src={adminPhoto} 
                  alt={adminData.name || "Admin"} 
                  className="w-full h-full object-cover filter brightness-90 contrast-110"
                />
              ) : (
                <span className="text-4xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                  {initial}
                </span>
              )}
            </div>
          </div>

          {/* Core Info Meta */}
          <div className="text-center sm:text-left space-y-1">
            <div className="text-[9px] font-black uppercase text-emerald-400 tracking-widest flex items-center justify-center sm:justify-start gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
            </div>
            <h3 className="text-2xl font-black text-white tracking-wider uppercase">{adminData.name}</h3>
            <p className="text-cyan-500 text-xs font-bold tracking-wide">
              USERNAME: <span className="text-orange-400 font-black">{adminData.user?.username || "NOT_DEFINED"}</span>
            </p>
          </div>
        </div>

        {/* INPUT DISPLAY DATA MATRIX */}
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase mb-2 block">
              👤 FULL NAME
            </label>
            <div className="w-full px-4 py-3.5 bg-[#010a14] border border-cyan-950 text-xs rounded text-cyan-50 font-bold uppercase tracking-wider relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.75 before:bg-cyan-600">
              {adminData.name}
            </div>
          </div>
          
          <div>
            <label className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase mb-2 block">
              📧 EMAIL ADDRESS
            </label>
            <div className="w-full px-4 py-3.5 bg-[#010a14] border border-cyan-950 text-xs rounded text-cyan-50 font-bold tracking-wider relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.75 before:bg-cyan-600">
              {adminData.user?.email || "NO MAINFRAME EMAIL ROUTED"}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}