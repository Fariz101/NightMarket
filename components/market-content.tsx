/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  photo?: string;
  description?: string;
  sold?: number;
}

interface TransactionItem {
  id: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  paymentProof?: string;
  items?: Array<
    | { name: string; quantity: number }
    | { product: { name: string }; amount: number }
  >;
  transactionItems?: Array<{ product: { name: string }; amount: number }>;
}

function getClientCookie(name: string): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

function SearchParamsReader({ onSearch }: { onSearch: (val: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onSearch(searchParams.get("search") || "");
  }, [searchParams, onSearch]);
  return null;
}

function MarketExplorationContent() {
  const [search, setSearch] = useState("");

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [kategoriSel, setKategoriSel] = useState("Semua Kategori");
  const [urutkan, setUrutkan] = useState("Terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [uploadingTrxId, setUploadingTrxId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchInitialData();

    window.addEventListener("transaction_success", fetchInitialData);
    return () => window.removeEventListener("transaction_success", fetchInitialData);
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const token = getClientCookie("token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/product`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.data)) setProducts(resData.data);
        else if (Array.isArray(resData)) setProducts(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/transaction/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.data)) setTransactions(resData.data);
        else if (Array.isArray(resData)) setTransactions(resData);
      })
      .catch((err) => console.error(err));
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchSearch = (item.name || "").toLowerCase().includes(search.toLowerCase());
        const matchKategori = kategoriSel === "Semua Kategori" || item.category === kategoriSel;
        return matchSearch && matchKategori;
      })
      .sort((a, b) => {
        if (urutkan === "Harga Termurah") return a.price - b.price;
        if (urutkan === "Harga Termahal") return b.price - a.price;
        if (urutkan === "Penjualan Terbanyak") return (b.sold || 0) - (a.sold || 0);
        if (urutkan === "Penjualan Terkecil") return (a.sold || 0) - (b.sold || 0);
        return 0;
      });
  }, [search, kategoriSel, urutkan, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const listKategoriUnik = useMemo(() => {
    const setKategori = new Set(products.map((p) => p.category).filter(Boolean));
    return ["Semua Kategori", ...Array.from(setKategori)];
  }, [products]);

  const addToCart = async (product: ProductItem) => {
    if (product.stock <= 0) return alert("Stok habis!");
    const token = getClientCookie("token");
    if (!token) return alert("Anda belum login");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/cart`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: Number(product.id), amount: 1 }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(`${product.name} dimasukkan ke keranjang!`);
        window.dispatchEvent(new Event("cart_updated"));
      } else {
        alert(`Gagal: ${result.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadProof = async (transactionId: string, file: File) => {
    if (!file) return;
    setUploadingTrxId(transactionId);
    try {
      const token = getClientCookie("token");
      const formData = new FormData();
      formData.append("paymentProof", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/transaction/${transactionId}/payment`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (response.ok) {
        alert("Bukti pembayaran berhasil diunggah!");
        fetchInitialData();
      } else {
        alert("Gagal mengunggah bukti.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingTrxId(null);
    }
  };

  return (
    <div className="p-4 bg-transparent min-h-full text-white font-mono flex flex-col space-y-6">
        <Suspense fallback={null}>
        <SearchParamsReader onSearch={setSearch} />
      </Suspense>
      {/* FILTER CONTROL HUD */}
      <div className="relative bg-[#020f1d]/80 backdrop-blur-xl border border-cyan-500/30 p-5 rounded-tl-2xl rounded-br-2xl shadow-[inset_0_0_15px_rgba(6,182,212,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-[9px] tracking-[0.25em] text-cyan-400/60 font-black mb-0.5 uppercase">
            Page // Marketplace
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white">
            Product Catalog
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <select
              value={kategoriSel}
              onChange={(e) => {
                setKategoriSel(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#010a14] border border-cyan-500/30 text-cyan-400 rounded-lg pl-3 pr-8 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-cyan-400 transition-all cursor-pointer w-full md:w-44 appearance-none"
            >
              {listKategoriUnik.map((kat) => (
                <option key={kat} value={kat} className="bg-[#021020] text-cyan-300">
                  {kat}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500 text-[10px]">
              ▼
            </div>
          </div>

          <div className="relative w-full md:w-auto">
            <select
              value={urutkan}
              onChange={(e) => setUrutkan(e.target.value)}
              className="bg-[#010a14] border border-cyan-500/30 text-cyan-400 rounded-lg pl-3 pr-8 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-cyan-400 transition-all cursor-pointer w-full md:w-56 appearance-none"
            >
              <option value="Terbaru" className="bg-[#021020] text-cyan-300">
                Terbaru
              </option>
              <option value="Harga Termurah" className="bg-[#021020] text-cyan-300">
                Harga: Rendah → Tinggi
              </option>
              <option value="Harga Termahal" className="bg-[#021020] text-cyan-300">
                Harga: Tinggi → Rendah
              </option>
              <option value="Penjualan Terbanyak" className="bg-[#021020] text-cyan-300">
                Penjualan Terbanyak
              </option>
              <option value="Penjualan Terkecil" className="bg-[#021020] text-cyan-300">
                Penjualan Terkecil
              </option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500 text-[10px]">
              ▼
            </div>
          </div>

          <button
            onClick={() => {
              setIsHistoryOpen(true);
              fetchInitialData();
            }}
            className="w-full md:w-auto px-5 py-2.5 border-t border-b border-orange-500/40 bg-linear-to-r from-orange-600/20 to-orange-500/30 text-orange-400 font-black rounded-tl-lg rounded-br-lg text-xs uppercase hover:from-orange-500/40 hover:to-orange-400/50 hover:text-white transition-all duration-200 shadow-[0_0_15px_rgba(249,115,22,0.1)] cursor-pointer whitespace-nowrap"
          >
            📋 Log Transaksi
          </button>
        </div>
      </div>

      {/* CATALOG CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-28 text-center text-cyan-400 animate-pulse text-xs uppercase tracking-widest font-bold">
            Loading products catalog...
          </div>
        ) : paginatedProducts.length > 0 ? (
          paginatedProducts.map((prod, i) => (
            <div
              key={prod.id || `p-${i}`}
              className="bg-[#030e1b]/90 border border-cyan-500/30 hover:border-cyan-400 rounded-tl-2xl rounded-br-2xl overflow-hidden transition-all duration-300 flex flex-col group relative shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-linear-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div
                onClick={() => setSelectedProduct(prod)}
                className="w-full h-44 bg-[#010710] relative overflow-hidden border-b border-cyan-950 cursor-pointer"
              >
                {prod.photo ? (
                  <img
                    src={prod.photo}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700/50 gap-2">
                    <span className="text-2xl">📦</span>
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      No Product Photo
                    </span>
                  </div>
                )}

                <span className="absolute top-3 left-3 text-[8px] font-black tracking-widest bg-[#020e1a]/95 border border-cyan-500/40 text-cyan-400 px-2 py-0.5 rounded-tl-md rounded-br-md uppercase shadow-md">
                  {prod.category || "General Asset"}
                </span>

                <span className="absolute top-3 right-3 text-[8px] font-black tracking-wider bg-orange-950/90 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded-tl-md rounded-br-md shadow-md uppercase">
                  {prod.sold || 0} Terjual
                </span>

                <span className="absolute bottom-2 right-3 text-[9px] font-mono text-cyan-600 font-bold bg-[#010811]/80 px-1.5 py-0.5 rounded border border-cyan-950">
                  ID-{String(prod.id || "").slice(-4).toUpperCase()}
                </span>

                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-[#020f1d]/90 border border-cyan-400 text-cyan-400 font-black text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-tl-md rounded-br-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    🔍 VIEW DETAIL
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-linear-to-b from-[#020e1c]/40 to-[#010812]/90">
                <div className="cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                  <h4 className="text-white font-black text-sm tracking-wide uppercase line-clamp-2 h-10 group-hover:text-cyan-300 transition-colors">
                    {prod.name}
                  </h4>
                  <div className="mt-2 bg-[#01070f] p-2 rounded border border-cyan-950">
                    <span className="text-[8px] text-cyan-600/80 font-black uppercase tracking-wider block">
                      Price
                    </span>
                    <p className="text-orange-400 text-base font-black tracking-wide">
                      Rp {(prod.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-cyan-500/70 font-bold px-1">
                    <span>UNIT QUANTITY:</span>
                    <span className={prod.stock > 0 ? "text-cyan-400" : "text-red-400 font-black"}>
                      {prod.stock > 0 ? `${prod.stock} STOCKS` : "EMPTY"}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(prod)}
                    disabled={prod.stock <= 0}
                    className="w-full py-2.5 relative overflow-hidden group/btn disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-tl-xl rounded-br-xl text-xs uppercase tracking-widest transition-all focus:outline-none cursor-pointer bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_4px_15px_rgba(249,115,22,0.2)]"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-white/40 group-hover/btn:translate-x-100 transition-transform duration-1000 ease-out" />
                    {prod.stock > 0 ? "➕ ADD TO CART" : "❌ PRODUCT NOT AVAILABLE"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-cyan-500/20 bg-[#020e1a]/40 rounded-2xl text-cyan-500/60 font-black text-xs uppercase tracking-widest">
            NO PRODUCTS FOUND
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-between items-center border-t border-cyan-500/20 pt-5 text-xs text-cyan-600 font-bold">
          <div className="uppercase tracking-wider">
            INDEX: {paginatedProducts.length} / {filteredProducts.length} PRODUCTS SHOWED
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center bg-[#020d1a] border border-cyan-500/30 rounded text-cyan-400 disabled:opacity-20 transition-all hover:border-cyan-400 cursor-pointer"
            >
              ◀
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded border text-center text-[10px] font-black transition-all cursor-pointer ${currentPage === p ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-[#020d1a] border-cyan-500/30 text-cyan-400 hover:border-cyan-500"}`}
              >
                {String(p).padStart(2, "0")}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center bg-[#020d1a] border border-cyan-500/30 rounded text-cyan-400 disabled:opacity-20 transition-all hover:border-cyan-400 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* PORTAL MODAL PRODUCT DETAIL */}
      {mounted &&
        selectedProduct &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-99999 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#020f1d] border border-cyan-400 rounded-tl-3xl rounded-br-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col md:flex-row max-h-[90vh] md:max-h-none">
              <div className="w-full md:w-1/2 h-56 md:h-auto min-h-60 bg-[#010710] relative border-b md:border-b-0 md:border-r border-cyan-950">
                {selectedProduct.photo ? (
                  <img
                    src={selectedProduct.photo}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover filter brightness-95"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-cyan-800 gap-2">
                    <span className="text-4xl">📦</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      No Manifest Image
                    </span>
                  </div>
                )}
                <span className="absolute top-4 left-4 text-[9px] font-black tracking-widest bg-[#020e1a] border border-cyan-400 text-cyan-400 px-2.5 py-1 rounded-tl-md rounded-br-md uppercase shadow-lg">
                  {selectedProduct.category || "General Asset"}
                </span>
              </div>

              <div className="w-full md:w-1/2 p-5 flex flex-col justify-between overflow-y-auto space-y-5 bg-linear-to-b from-[#020e1c] to-[#010812]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black text-cyan-500 tracking-widest block uppercase">
                        Product Detail
                      </span>
                      <h3 className="text-base font-black text-white uppercase tracking-wide mt-0.5 leading-snug">
                        {selectedProduct.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-7 h-7 flex items-center justify-center border border-cyan-500/30 rounded bg-[#010a14] text-cyan-400 hover:text-white hover:border-cyan-400 transition-all font-bold text-xs cursor-pointer shadow-md"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#01070f] p-2.5 rounded border border-cyan-950 font-mono text-[9px]">
                    <div>
                      <span className="text-cyan-600 block text-[7px] uppercase font-black">
                        ID:
                      </span>
                      <span className="text-cyan-300 font-bold truncate block">
                        #{selectedProduct.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-600 block text-[7px] uppercase font-black">
                        STOCK:
                      </span>
                      <span className={selectedProduct.stock > 0 ? "text-cyan-400 font-bold" : "text-red-400 font-bold"}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} U` : "EMPTY"}
                      </span>
                    </div>
                    <div>
                      <span className="text-orange-500 block text-[7px] uppercase font-black">
                        SOLD:
                      </span>
                      <span className="text-orange-400 font-black">
                        {selectedProduct.sold || 0} SOLD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-cyan-500 tracking-widest block uppercase">
                      Description
                    </span>
                    <div className="bg-[#01070f]/50 border border-cyan-950/60 p-3 rounded text-[11px] text-gray-300 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
                      {selectedProduct.description || (
                        <span className="text-cyan-700/60 italic">No Description.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-cyan-950">
                  <div className="flex justify-between items-center bg-[#01070f] p-2.5 rounded border border-cyan-950">
                    <span className="text-cyan-500 font-black uppercase tracking-widest text-[8px]">
                      PRICE
                    </span>
                    <span className="text-orange-400 font-black text-base tracking-wide">
                      Rp {(selectedProduct.price || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.stock <= 0}
                      className="w-full py-3 relative overflow-hidden group/btnModal disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-tl-xl rounded-br-xl text-xs uppercase tracking-widest transition-all bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_4px_15px_rgba(249,115,22,0.3)] cursor-pointer"
                    >
                      {selectedProduct.stock > 0 ? "➕ ADD TO CART" : "EMPTY"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* PORTAL TRANSMISSION DRAWER MODAL */}
      {mounted &&
        isHistoryOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-9999 flex justify-end animate-in fade-in duration-200">
            <div className="bg-[#020d19]/95 border-l border-cyan-500/30 w-full max-w-md h-full flex flex-col text-white font-mono shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="p-4 bg-[#031426] border-b border-cyan-500/20 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black text-cyan-500 tracking-widest block uppercase">
                    Transaction Logs
                  </span>
                  <h3 className="text-xs font-black uppercase text-orange-400 tracking-wider">
                    Transaction History
                  </h3>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-7 h-7 flex items-center justify-center border border-cyan-500/30 rounded bg-[#010a14] text-cyan-400 hover:text-white hover:border-cyan-400 transition-all font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-28 text-cyan-700/60 text-xs font-bold uppercase tracking-wider">
                    No transactions found
                  </div>
                ) : (
                  transactions.map((trx, tIdx) => (
                    <div
                      key={trx.id || `t-${tIdx}`}
                      className="bg-[#010812] border border-cyan-500/20 rounded-tl-xl rounded-br-xl p-3.5 space-y-3 flex flex-col shadow-inner"
                    >
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-cyan-400 font-black tracking-widest">
                          LOG-#
                          {trx.id ? String(trx.id).slice(-8).toUpperCase() : "UNKNOWN"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${trx.status?.toLowerCase() === "approved" || trx.status?.toLowerCase() === "selesai" || trx.status?.toLowerCase() === "paid" ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40" : trx.status?.toLowerCase() === "rejected" ? "bg-red-950/80 text-red-400 border-red-500/40" : "bg-amber-950/80 text-amber-400 border-amber-500/40"}`}
                        >
                          {trx.status || "Pending"}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-gray-300 text-xs bg-[#020e1a]/50 p-2.5 rounded border border-cyan-950">
                        {(trx.transactionItems || trx.items)?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-white/90 font-medium truncate max-w-60">
                              🔹 {item.product?.name || item.name || "Unknown Asset"}
                            </span>
                            <span className="text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-900 px-1.5 py-0.5 rounded text-[10px]">
                              x{item.amount || item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-cyan-950 text-cyan-600 font-bold">
                        <span>
                          DATE: {trx.createdAt ? new Date(trx.createdAt).toLocaleDateString("id-ID") : "-"}
                        </span>
                        <span className="text-orange-400 font-black text-xs">
                          Rp {(trx.totalPrice || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {trx.status?.toUpperCase() === "PENDING" && !trx.paymentProof && (
                        <div className="mt-1 pt-2.5 border-t border-cyan-500/10">
                          <p className="text-[9px] text-amber-400 mb-1.5 font-black uppercase tracking-wider">
                            ▲ PAYMENT PROOF REQUIRED (MAX 5MB):
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadProof(trx.id, e.target.files[0]);
                              }
                            }}
                            disabled={uploadingTrxId === trx.id}
                            className="text-[9px] text-slate-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-tl file:rounded-br file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-orange-500 file:text-white hover:file:bg-orange-600 w-full cursor-pointer disabled:opacity-30"
                          />
                          {uploadingTrxId === trx.id && (
                            <span className="text-[9px] text-cyan-400 animate-pulse mt-1.5 block font-bold">
                              SENDING PAYMENT PROOF...
                            </span>
                          )}
                        </div>
                      )}
                      {trx.paymentProof && trx.status?.toUpperCase() === "PENDING" && (
                        <div className="mt-1 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded text-center">
                          <p className="text-[9px] text-emerald-400 font-black uppercase tracking-wide">
                            ✓ PAYMENT SUBMITTED, WAITING FOR APPROVAL
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
export default MarketExplorationContent;
