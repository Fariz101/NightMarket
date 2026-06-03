"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { storeCookie } from "@/lib/client-cookies";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const request = JSON.stringify({ email, password });
      const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "app-key": `${process.env.NEXT_PUBLIC_APP_KEY}`,
        },
        body: request,
      });

      if (!response.ok) {
        alert("Gagal melakukan login. Periksa kembali email dan password Anda.");
        return;
      }

      const responseData = await response.json();
      const { token, role } = responseData.data || responseData;

      if (token && role) {
        storeCookie("token", token, 1);
        storeCookie("role", role, 1);
        alert(responseData.message || "Login Berhasil!");

        if (role === "ADMIN") router.push("/admin/dashboard");
        else if (role === "SELLER") router.push("/seller/dashboard");
        else router.push("/customer/dashboard");
      } else {
        alert("Response tidak valid dari server, Periksa kembali email dan password Anda.");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#020712] flex items-center justify-center p-4 overflow-hidden font-mono text-cyan-100">
      
      {/* LAPISAN 1: GRADASI WARNA PALUNG LAUT (DEEP OCEAN TONE) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#093554_0%,#031628_50%,#01060f_100%)] z-0" />
      
      {/* LAPISAN 2: GRID LABIRIN DIGITAL HUD */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d405_1px,transparent_1px),linear-gradient(to_bottom,#06b6d405_1px,transparent_1px)] bg-size-[32px_32px] z-0" />
      
      {/* LAPISAN 3: PENDARAN CAHAYA MAKHLUK LAUT (BIOLUMINESCENT GLOW) */}
      <div className="absolute top-12 left-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-12 right-12 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse [animation-duration:6s]" />

      {/* ELEMEN TAMBAHAN: GELEMBUNG ATMOSFERIK */}
      <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-cyan-400/40 rounded-full blur-xs animate-bounce [animation-duration:5s] pointer-events-none" />
      <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-cyan-500/20 rounded-full blur-sm animate-bounce [animation-duration:8s] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-emerald-400/30 rounded-full blur-xs animate-ping [animation-duration:4s] pointer-events-none" />

      {/* SUBNAUTICA HIGH-TECH CONTAINER */}
      <div className="relative z-10 w-full max-w-md bg-[#031224]/85 backdrop-blur-xl border-2 border-cyan-500/30 rounded-br-3xl rounded-tl-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] before:content-[''] before:absolute before:top-0 before:left-0 before:w-6 before:h-6 before:border-t-4 before:border-l-4 before:border-orange-500 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-6 after:border-b-4 after:border-r-4 after:border-orange-500">
        
        {/* Header PDA Interface */}
        <div className="flex justify-between items-center border-b border-cyan-950 pb-3 mb-6 text-[10px] tracking-widest text-cyan-500/60 font-bold">
          <span>NightMarket</span>
          <span className="text-emerald-400 animate-pulse">● LOGIN</span>
        </div>

        <div className="text-center mb-8">
          <span className="text-4xl font-black tracking-widest text-white cursor-pointer transition-transform duration-200 active:scale-95" onClick={() => router.push('/customer/dashboard')}>
            <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">N</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] group-hover:text-white transition-colors">MARKET</span>
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-linear-to-r from-transparent to-orange-500" />
            <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">USER ACCESS</p>
            <span className="h-px w-6 bg-linear-to-l from-transparent to-orange-500" />
          </div>
        </div>

        {/* Form Input */}
        <form className="space-y-5" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2">
              📧 EMAIL
            </label>
            <input 
              type="email" 
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 bg-[#010a14] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 font-mono text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                🔑 PASSWORD
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[9px] text-orange-400 hover:text-orange-300 transition-colors uppercase font-bold focus:outline-none"
              >
                {showPassword ? "[ Hide ]" : "[ View ]"}
              </button>
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#010a14] border border-cyan-900/60 rounded text-cyan-100 placeholder-cyan-950 font-mono text-xs focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full relative group mt-8 block disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-linear-to-r from-orange-600 to-amber-500 blur-sm opacity-30 group-hover:opacity-80 transition-opacity rounded" />
            <div className="relative w-full py-3.5 bg-linear-to-r from-orange-600 to-orange-500 border border-orange-400/30 rounded text-white font-black text-xs tracking-[0.2em] transition-all transform group-active:scale-[0.99] text-center uppercase">
            {loading ? "LOADING..." : "LOGIN EXECUTION"}
            </div>
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-cyan-950/60 text-center text-[11px]">
          <span className="text-cyan-600">Unregistered user?</span>{" "}
          <Link href="/signup" className="text-orange-400 font-bold hover:text-orange-300 underline underline-offset-4 transition-colors uppercase tracking-wider">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}   