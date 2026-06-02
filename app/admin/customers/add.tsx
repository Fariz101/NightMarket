"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function AddCustomer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (file) {
        formData.append("photo", file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Customer data added successfully!");
        setIsOpen(false);
        setName(""); setPhone(""); setAddress(""); setUsername(""); setEmail(""); setPassword(""); setFile(null);
        router.refresh();
      } else {
        const errorMsg = Array.isArray(res.message) ? res.message.join(", ") : res.message;
        alert(`Error: ${errorMsg || "failed to add customer."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase px-5 py-3 rounded-tl-lg rounded-br-lg border border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all font-mono tracking-widest relative cursor-pointer overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-1 before:bg-white"
      >
        + Create New Customer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono text-xs">
          <div className="bg-[#031224]/95 border-2 border-cyan-500/30 rounded-tl-2xl rounded-br-2xl w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white relative p-1 before:content-[''] before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-orange-500">
            
            <div className="p-5 bg-[#010912]/90 border-b border-cyan-950 flex justify-between items-center rounded-tl-xl">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">CREATE CUSTOMER DATA</h3>
                <p className="text-[9px] text-cyan-500 font-bold tracking-wider mt-0.5">CREATE NEW CUSTOMER</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-600 hover:text-orange-400 text-sm font-black transition-colors cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-[#020d1a]/40">
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">FULL NAME</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">USERNAME</label>
                <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">PHONE</label>
                <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">ADDRESS</label>
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">EMAIL</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">PASSWORD</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1.5">PROFILE PHOTO (OPTIONAL)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }} 
                  className="w-full bg-[#010810] border border-cyan-950 text-cyan-500 rounded p-1.5 text-[11px] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-cyan-950 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-900 transition-colors" 
                />
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-cyan-950/80 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-cyan-950 text-cyan-500 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-950/20 hover:text-cyan-300 transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-orange-500 text-white font-black text-[10px] rounded uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  {loading ? "CREATING..." : "CREATE CUSTOMER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}