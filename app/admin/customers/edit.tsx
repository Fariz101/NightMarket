"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Customer } from "@/app/types";

interface EditCustomerProps {
  selectedData: Customer;
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function EditCustomer({ selectedData }: EditCustomerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedData) {
      setName(selectedData.name || "");
      setPhone(selectedData.phone || "");
      setAddress(selectedData.address || "");
      setFile(null);
    }
  }, [isOpen, selectedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("address", address);
      if (file) {
        formData.append("file", file); 
      }
      

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customer/${selectedData.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Customer data updated successfully!");
        setIsOpen(false);
        router.refresh();
      } else {
        const errorMsg = Array.isArray(res.message) ? res.message.join(", ") : res.message;
        alert(`Error: ${errorMsg || "failed to update customer."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while updating customer.");
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto font-mono text-xs">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsOpen(false)} />

        <div className="relative bg-[#031224]/95 border-2 border-cyan-500/30 rounded-tl-2xl rounded-br-2xl w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white text-left z-50 p-1 before:content-[''] before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-2 before:border-l-2 before:border-orange-500">
          
          <div className="p-5 border-b border-cyan-950 flex justify-between items-center bg-[#010912]/90 rounded-tl-xl">
            <div>
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em]">MODIFY CUSTOMER DATA</h3>
              <p className="text-[9px] text-cyan-600 font-bold tracking-wider mt-0.5">MODIFY THIS CUSTOMER DATA</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-cyan-600 hover:text-orange-400 text-sm font-black transition-colors cursor-pointer">✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-[#020d1a]/40">
            <div>
              <label className="block text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-1">ID</label>
              <input type="text" disabled value={selectedData.id} className="w-full bg-[#01070e] border border-cyan-950 text-cyan-700 font-bold rounded p-2.5 opacity-60 cursor-not-allowed select-all text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-1">USERNAME</label>
              <input type="text" disabled value={selectedData.user?.username || ""} className="w-full bg-[#01070e] border border-cyan-950 text-cyan-700 font-bold rounded p-2.5 opacity-60 cursor-not-allowed text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">FULL NAME</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">PHONE</label>
              <input 
                required 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">ADDRESS</label>
              <input 
                required 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-[#010810] border border-cyan-950 text-cyan-50 rounded p-2.5 focus:outline-none focus:border-cyan-500 text-xs transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">UPDATE PROFILE PHOTO</label>
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
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-cyan-950 text-cyan-500 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-950/20 hover:text-cyan-300 transition-all cursor-pointer">Abort</button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-orange-500 text-white font-black text-[10px] rounded uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                {loading ? "UPDATING..." : "SAVE CHANGES"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-cyan-400 hover:text-white font-bold text-xs uppercase tracking-wider font-mono transition-colors px-2 py-1 bg-cyan-950/30 hover:bg-cyan-950/60 rounded border border-cyan-950 hover:border-cyan-900/60 cursor-pointer"
      >
        Modify
      </button>

      {mounted && isOpen && createPortal(renderModalContent(), document.body)}
    </>
  );
}