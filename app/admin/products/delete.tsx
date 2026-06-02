"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Product } from "@/app/types";

interface DeleteProductProps {
  selectedData: Product;
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function DeleteProduct({ selectedData }: DeleteProductProps) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/product/${selectedData.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Product deleted successfully.");
        setIsOpen(false);
        router.refresh(); 
      } else {
        alert(`Delete Interrupted: ${res.message || "Operation failed."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failsafe activated: Terminal communication down.");
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 text-center font-mono">
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        
        <div className="relative bg-[#031224] border border-red-500/50 rounded-br-2xl rounded-tl-2xl w-full max-w-sm shadow-[0_0_25px_rgba(239,68,68,0.15)] p-6 text-xs text-white z-50 border-l-4 border-l-red-500">
          <h3 className="text-sm font-black text-red-500 mb-2 uppercase tracking-widest">DELETE PRODUCT DATA?</h3>
          <p className="text-cyan-500/80 mb-6 leading-relaxed font-bold text-[11px]">
            Data produk <span className="text-white underline font-black">{selectedData.name}</span> akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div className="flex justify-center gap-3">
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className="px-4 py-1.5 border border-cyan-900 text-cyan-400 rounded-tl-md rounded-br-md hover:bg-cyan-950 w-full transition-all uppercase font-bold text-[11px]"
            >
              CANCEL
            </button>
            <button 
              type="button"
              onClick={handleDelete} 
              disabled={loading} 
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-950 text-white font-black rounded-tl-md rounded-br-md w-full uppercase tracking-wider transition-all text-[11px]"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
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
        className="text-red-500 hover:text-red-400 font-bold text-xs font-mono transition-colors tracking-wide uppercase hover:underline"
      >
        DELETE
      </button>

      {mounted && isOpen && createPortal(renderModal(), document.body)}
    </>
  );
}