"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SellerOption {
  id: string;
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

export default function AddProduct() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState<SellerOption[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      const token = getClientCookie("token");
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/seller`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData && Array.isArray(resData.data)) {
            setSellers(resData.data);
          } else if (Array.isArray(resData)) {
            setSellers(resData);
          }
        })
        .catch((err) => console.error("Error loading seller data:", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return alert("Please select a valid station manager (seller).");
    setLoading(true);

    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("sellerId", sellerId);
      
      if (file) formData.append("photo", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const res = await response.json();

      if (response.ok && res.success) {
        alert("Product added successfully!");
        setIsOpen(false);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setStock("");
        setSellerId("");
        setFile(null);
        router.refresh();
      } else {
        const errorMsg = Array.isArray(res.message) ? res.message.join(", ") : res.message;
        alert(`Error: ${errorMsg || "Failed to add product."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terminal Connection Interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-transparent hover:bg-orange-500/10 text-orange-400 border border-orange-500/40 font-bold text-xs uppercase px-4 py-2 rounded-tl-md rounded-br-md shadow-lg transition-all duration-200 tracking-wider active:scale-95"
      >
        + CREATE NEW PRODUCT
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs">
          <div className="bg-[#031224] border border-cyan-800/80 rounded-br-2xl rounded-tl-2xl w-full max-w-md shadow-2xl text-white border-l-4 border-l-orange-500">
            <div className="p-4 border-b border-cyan-950 flex justify-between items-center bg-[#010912] rounded-tl-2xl">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">CREATE NEW PRODUCT</h3>
              <button onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-white transition-colors text-sm">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">SELLER *</label>
                <div className="relative">
                  <select 
                    required 
                    value={sellerId} 
                    onChange={(e) => setSellerId(e.target.value)}
                    className="w-full bg-[#010810] border border-cyan-900 text-cyan-100 rounded p-2 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  >
                    <option value="" className="text-cyan-800">-- SELECT SELLER --</option>
                    {sellers.map((sel) => (
                      <option key={sel.id} value={sel.id} className="bg-[#031224]">
                        {sel.storeName || sel.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-orange-500 text-[9px]">▼</div>
                </div>
              </div>

              <div>
                <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">PRODUCT NAME</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
              </div>

              <div>
                <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">CATEGORY *</label>
                <div className="relative">
                  <select 
                    required 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#010810] border border-cyan-900 text-cyan-100 rounded p-2 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- SELECT CATEGORY --</option>
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
                  <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">PRICE (RP)</label>
                  <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">STOCK</label>
                  <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">PRODUCT DESCRIPTION</label>
                <textarea 
                  required 
                  rows={2}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-[#010810] border border-cyan-900 text-white rounded p-2 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-orange-400 mb-1 font-black uppercase text-[9px] tracking-wider">PRODUCT PHOTO (OPTIONAL)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                  }} 
                  className="w-full bg-[#010810] border border-cyan-900 text-cyan-400 rounded p-1 file:mr-3 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-black file:bg-cyan-950 file:text-cyan-400 file:cursor-pointer hover:file:bg-cyan-900" 
                />
              </div>

              <div className="mt-2 flex justify-end gap-3 border-t border-cyan-950 pt-4 bg-[#010912] -mx-5 -mb-5 p-4 rounded-br-2xl">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-1.5 border border-cyan-900 text-cyan-400 rounded-tl-md rounded-br-md hover:bg-cyan-950 transition-colors uppercase font-bold text-[11px]">Abort</button>
                <button type="submit" disabled={loading} className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-950 text-white font-black rounded-tl-md rounded-br-md uppercase tracking-wider transition-colors text-[11px]">
                  {loading ? "Syncing..." : "Commit Entity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}