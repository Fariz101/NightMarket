"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Customer } from "@/app/types";

interface DeleteCustomerProps {
  selectedData: Customer;
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function DeleteCustomer({ selectedData }: DeleteCustomerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = getClientCookie("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/customer/${selectedData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Customer data deleted successfully!");
        setIsOpen(false);
        router.refresh();
      } else {
        alert(`Error: ${res.message || "failed to delete customer."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while deleting customer.");
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 text-center font-mono text-xs">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
        
        <div className="relative bg-[#120505]/95 border-2 border-red-500/30 rounded-tl-xl rounded-br-xl w-full max-w-sm shadow-[0_0_40px_rgba(239,68,68,0.15)] p-6 text-white z-50 animate-in fade-in zoom-in-95 duration-150 text-left before:content-[''] before:absolute before:top-0 before:left-0 before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:border-red-500">
          <div className="text-[10px] font-black tracking-widest text-red-500/60 mb-1 uppercase"></div>
          <h3 className="text-lg font-black text-red-400 mb-2 uppercase tracking-wide">DELETE CUSTOMER DATA?</h3>
          
          <p className="text-cyan-500/80 mb-6 leading-relaxed">
            Data customer <span className="text-white font-black uppercase tracking-wide bg-cyan-950 px-1 py-0.5">{selectedData.name}</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div className="flex justify-center gap-3 border-t border-red-950/50 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className="px-4 py-2 border border-cyan-950 text-cyan-500 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-950/20 hover:text-cyan-300 w-full transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleDelete} 
              disabled={loading} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-black text-[10px] rounded w-full uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              {loading ? "DELETING..." : "CONFIRM DELETE"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider font-mono transition-colors px-2 py-1 bg-red-950/20 hover:bg-red-950/40 rounded border border-red-950 hover:border-red-900/50 cursor-pointer"
      >
        Delete
      </button>

      {mounted && isOpen && createPortal(renderModal(), document.body)}
    </>
  );
}