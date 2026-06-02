/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Product } from "@/app/types";

interface EditProductProps {
  selectedData: Product;
}

interface SellerOption {
  id: string | number;
  userId: string | number;
  name: string;
  storeName?: string;
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

// Helper untuk decode JWT token di Client Side
function decodeJwtClient(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

export default function EditProduct({ selectedData }: EditProductProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // State Informasi Terkunci
  const [currentStoreName, setCurrentStoreName] = useState("Loading Station...");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && selectedData) {
      setName(selectedData.name || "");
      setDescription(selectedData.description || "");
      setCategory(selectedData.category || "");
      setPrice(selectedData.price?.toString() || "");
      setStock(selectedData.stock?.toString() || "");
      setFile(null);

      // Default fallback dari data bawaan produk
      const initialSellerId = selectedData.seller?.id || "-";
      setSellerId(initialSellerId.toString());
      setCurrentStoreName(selectedData.seller?.name || "-");

      const token = getClientCookie("token");
      const decoded = decodeJwtClient(token);
      const activeUserId = decoded?.id; // ID User login saat ini (contoh: 7)

      // Ambil segment seller untuk mencocokkan & mengamankan lock ID
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/seller`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          const sellerList: SellerOption[] = resData.data || resData || [];
          if (Array.isArray(sellerList)) {
            // Cari store seller yang userId-nya sama dengan user login saat ini
            const matchedSeller = sellerList.find(
              (sel) => Number(sel.userId) === Number(activeUserId)
            );
            if (matchedSeller) {
              setSellerId(matchedSeller.id.toString());
              setCurrentStoreName(matchedSeller.storeName || matchedSeller.name);
            }
          }
        })
        .catch((err) => console.error("Gagal sinkronisasi kredensial seller:", err));
    }
  }, [isOpen, selectedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return alert("System authorization pending: Seller ID not found.");
    setLoading(true);

    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("sellerId", sellerId); // Otomatis terikat aman
      
      if (file) formData.append("photo", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/product/${selectedData.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Product modified successfully.");
        setIsOpen(false);
        router.refresh();
      } else {
        const errorMsg = Array.isArray(res.message) ? res.message.join(", ") : res.message;
        alert(`Modification Failed: ${errorMsg || "Protocol response error."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Core uplink network connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderModalContent = () => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 font-mono text-xs">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

        <div className="relative bg-[#031224] border border-cyan-800/80 rounded-br-2xl rounded-tl-2xl w-full max-w-md shadow-2xl text-white z-50 border-l-4 border-l-orange-500">
          <div className="p-4 border-b border-cyan-950 flex justify-between items-center bg-[#010912] rounded-tl-2xl">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">MODIFY PRODUCT</h3>
            <button onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-white text-sm">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-cyan-600 uppercase text-[8px] mb-0.5">PRODUCT ID</label>
                <input type="text" disabled value={`PRD-${selectedData.id}`} className="w-full bg-[#010810] border border-cyan-950 text-cyan-800 font-bold rounded p-2 cursor-not-allowed opacity-70" />
              </div>
              <div>
                <label className="block font-black text-cyan-600 uppercase text-[8px] mb-0.5">LOCKED SELLER ID</label>
                <input type="text" disabled value={sellerId ? `ID-${sellerId}` : "SYNCING..."} className="w-full bg-[#010810] border border-cyan-950 text-cyan-800 font-bold rounded p-2 cursor-not-allowed opacity-70" />
              </div>
            </div>

            <div>
              <label className="block font-black text-cyan-600 uppercase text-[9px] mb-1">SELLER</label>
              <input type="text" disabled value={currentStoreName.toUpperCase()} className="w-full bg-[#010810]/50 border border-cyan-950 text-orange-500/80 font-black rounded p-2 cursor-not-allowed uppercase" />
            </div>

            <div>
              <label className="block font-black text-orange-400 uppercase text-[9px] mb-1">PRODUCT NAME </label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
            </div>

            <div>
              <label className="block font-black text-orange-400 uppercase text-[9px] mb-1">CATEGORY *</label>
              <div className="relative">
                <select 
                  required 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#010810] border border-cyan-900 text-cyan-100 rounded p-2 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                >
                  <option value="ELECTRONICS" className="bg-[#031224]">ELECTRONICS</option>
                  <option value="FASHION" className="bg-[#031224]">FASHION</option>
                  <option value="HOME" className="bg-[#031224]">HOME</option>
                  <option value="HEALTH" className="bg-[#031224]">HEALTH</option>
                  <option value="SPORTS" className="bg-[#031224]">SPORTS</option>
                  <option value="TOYS" className="bg-[#031224]">TOYS</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-orange-500 text-[9px]">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-orange-400 uppercase text-[9px] mb-1">PRICE (RP)</label>
                <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block font-black text-orange-400 uppercase text-[9px] mb-1">STOCK</label>
                <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div>
              <label className="block font-black text-orange-400 uppercase text-[9px] mb-1">DESCRIPTION</label>
              <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500 resize-none" />
            </div>

            <div>
              <label className="block text-orange-400 text-[9px] font-black uppercase mb-1">PRODUCT PHOTO (OPTIONAL)</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); }} className="w-full bg-[#010810] border border-cyan-900 text-cyan-400 rounded p-1 file:mr-3 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-black file:bg-cyan-950 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-900" />
            </div>

            <div className="mt-2 flex justify-end gap-3 border-t border-cyan-950 pt-4 bg-[#010912] -mx-5 -mb-5 p-4 rounded-br-2xl">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-1.5 border border-cyan-900 text-cyan-400 rounded-tl-md rounded-br-md hover:bg-cyan-950 transition-all uppercase font-bold text-[11px]">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-1.5 bg-orange-500 text-white font-black rounded-tl-md rounded-br-md uppercase tracking-wider hover:bg-orange-600 disabled:bg-orange-950 transition-all text-[11px]">
                {loading ? "Modifying..." : "Save Changes"}
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
        className="text-cyan-400 hover:text-cyan-300 font-bold text-xs font-mono transition-colors tracking-wide uppercase hover:underline"
      >
        MODIFY
      </button>

      {mounted && isOpen && createPortal(renderModalContent(), document.body)}
    </>
  );
}