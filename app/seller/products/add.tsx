"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddProductProps {
  // Tambahkan prop callback agar halaman utama tahu kapan harus refresh data
  onProductAdded?: () => void; 
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function AddProduct({ onProductAdded }: AddProductProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [currentStoreName, setCurrentStoreName] = useState("Loading Station Credentials...");
  const [sellerId, setSellerId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      const token = getClientCookie("token");
      
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/seller/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((resData) => {
          const sellerData = resData.data || resData;
          if (sellerData && sellerData.id) {
            setSellerId(sellerData.id.toString());
            // Gunakan storeName atau name sesuai response asli backend Anda
            setCurrentStoreName(sellerData.storeName || sellerData.name || "UNKNOWN STATION");
          } else {
            setCurrentStoreName("FAILED TO PARSE STATION DATA");
          }
        })
        .catch((err) => {
          console.error("Error loading seller credentials:", err);
          setCurrentStoreName("CONNECTION TERMINAL FAILURE");
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("price", price);
      formData.append("stock", stock);
      if (file) formData.append("photo", file);

      // ⚠️ PERBAIKAN UTAMA: Hilangkan semua custom headers yang tidak perlu pada FormData
      // Biarkan browser yang mendefinisikan Content-Type secara otomatis
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/product`, {
        method: "POST",
        headers: { 
          // Cukup kirim Authorization token, JANGAN masukkan Content-Type: multipart/form-data secara manual!
          "Authorization": `Bearer ${token}` 
        },
        body: formData,
      });

      // Ambil text respons mentah terlebih dahulu untuk menghindari crash JSON parsing
      const responseText = await response.text();
      let res;
      try {
        res = JSON.parse(responseText);
      } catch (pErr) {
        res = { success: false, message: responseText };
      }

      // ⚠️ LOGIKA SENSITIF: Jangan langsung memunculkan alert sukses jika HTTP Status bukan 200/201
      if (response.ok && (res.success || response.status === 201)) {
        alert("Product added successfully!");
        
        // Reset Form State
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setStock("");
        setFile(null);
        setIsOpen(false);
        
        // Trigger refresh data di layar
        router.refresh();
        if (onProductAdded) onProductAdded();
      } else {
        // Tampilkan error asli yang digagalkan oleh sistem
        alert(`Gagal Menyimpan: ${res.message || "Request diblokir oleh browser/CORS."}`);
      }
    } catch (error) {
      console.error("Crash Error:", error);
      alert(`Network Error: ${error}`);
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
              <button type="button" onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-white transition-colors text-sm">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-cyan-600 mb-1 font-black uppercase text-[9px] tracking-wider">SELLER</label>
                <input 
                  type="text" 
                  disabled 
                  value={currentStoreName.toUpperCase()} 
                  className="w-full bg-[#010810]/60 border border-cyan-950 text-orange-400 font-black rounded p-2 cursor-not-allowed uppercase tracking-wide opacity-90"
                />
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
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-1.5 border border-cyan-900 text-cyan-400 rounded-tl-md rounded-br-md hover:bg-cyan-950 transition-colors uppercase font-bold text-[11px]">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-950 text-white font-black rounded-tl-md rounded-br-md uppercase tracking-wider transition-colors text-[11px]">
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}