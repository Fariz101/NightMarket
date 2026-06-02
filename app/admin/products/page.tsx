/* eslint-disable @next/next/no-img-element */
import React from "react";
import { cookies } from "next/headers";
import { Product } from "@/app/types"; 
import AddProduct from "./add";
import EditProduct from "./edit";
import DeleteProduct from "./delete";
import Search from "@/components/search";
import CategoryFilter from "@/components/category-filter";
import Pagination from "@/components/pagination";

async function getProducts(
  page: number,
  limit: number,
  search: string,
  category: string,
  sortBy: string, 
  sortOrder: string, 
  token: string,
): Promise<{
  success: boolean;
  message: string;
  data: Product[];
  count: number;
}> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/product?page=${page}&limit=${limit}&search=${search}&category=${category}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { success: false, message: responseData?.message || "Unauthorized", data: [], count: 0 };
    }

    let finalData: Product[] = [];
    if (Array.isArray(responseData)) {
      finalData = responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      finalData = responseData.data;
    } else if (responseData && Array.isArray(responseData.products)) {
      finalData = responseData.products;
    }

    const finalCount = responseData?.meta?.total ?? responseData?.total ?? finalData.length;

    return {
      success: responseData?.success ?? true,
      message: responseData?.message || "Success",
      data: finalData,
      count: finalCount,
    };
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    return { success: false, message: "Failed Connection", data: [], count: 0 };
  }
}

type Props = {
  searchParams: Promise<{
    page?: string | number;
    limit?: string | number;
    quantity?: string | number;
    search?: string;
    category?: string;
    sortBy?: string; 
    sortOrder?: string; 
  }>;
};

export default async function ProductsPage(prop: Props) {
  const resolvedSearchParams = await prop.searchParams;

  const page = Number(resolvedSearchParams?.page) || 1;
  // Kita ubah default limit ke 6 atau 9 supaya genap saat dibagi ke layout card 3 kolom
  const limit = Number(resolvedSearchParams?.limit || resolvedSearchParams?.quantity) || 6;
  const search = resolvedSearchParams?.search || "";
  const category = resolvedSearchParams?.category || ""; 
  const sortBy = resolvedSearchParams?.sortBy || "id"; 
  const sortOrder = resolvedSearchParams?.sortOrder || "asc"; 

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const { count: counts, data: products } = await getProducts(
    page,
    limit,
    search,
    category,
    sortBy,
    sortOrder,
    token,
  );

  return (
    <div className="space-y-8 font-mono text-cyan-100 p-2 min-h-screen bg-[#010a15]/30">
      
      {/* HEADER PANEL UTAMA */}
      <div className="relative bg-[#031224]/80 backdrop-blur-xl border border-cyan-900/60 p-6 rounded-br-2xl rounded-tl-2xl border-l-4 border-l-orange-500 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
        <div className="flex justify-between items-center text-[9px] tracking-widest text-cyan-500/50 font-black mb-1">
          <span>PAGE // PRODUCTS DATA</span>
          <span>DATA COUNT: {counts} PRODUCTS</span>
        </div>
        <h4 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          PRODUCTS DATA
        </h4>
        <p className="text-xs text-cyan-500/70 mt-1 uppercase font-bold tracking-wide">
          view and manage product data, including creating new products, editing existing ones, and deleting records as needed.
        </p>

        {/* ACTION UTILITY STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-[#010912]/80 p-3 rounded border border-cyan-950">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl grow">
            <Search search={search} placeholder="SEARCH PRODUCTS..." />
            <CategoryFilter category={category} />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <AddProduct />
          </div>
        </div>

        {/* DATA CONTAINER: BERUBAH MENJADI CARD GRID (3 KOLOM) */}
        {!products || products.length === 0 ? (
          <div className="mt-6 p-12 border border-dashed border-red-500/30 rounded bg-red-950/10 text-center text-red-400 text-xs uppercase tracking-[0.2em] font-black">
            NO PRODUCTS REGISTERED
          </div>
        ) : (
          <div className="mt-8">
            {/* GRID DETECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between bg-[#020b17]/90 border border-cyan-900/50 rounded-br-2xl rounded-tl-2xl overflow-hidden group hover:border-cyan-400 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative"
                >
                  {/* Floating ID Tag di Sudut Atas */}
                  <div className="absolute top-2 right-3 z-10 bg-cyan-950/90 border border-cyan-800 px-2 py-0.5 rounded text-[8px] font-black text-cyan-400 tracking-wider">
                    PRD-{product.id}
                  </div>

                  {/* VISUAL WRAPPER (Tempat Gambar Produk / Scanline Efek Game) */}
                  <div className="relative aspect-16/10 bg-[#01070e] overflow-hidden border-b border-cyan-950">
                    {product.photo ? (
                      <img
                        src={product.photo}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 filter brightness-90 contrast-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-cyan-700 select-none gap-2">
                        <span className="text-3xl">📦</span>
                        <span className="text-[9px] tracking-widest font-black opacity-40">NO PROUCT PHOTO</span>
                      </div>
                    )}
                    
                    {/* Overlay Tag Kategori */}
                    <div className="absolute bottom-2 left-2 bg-black/70 border border-cyan-900/50 px-2 py-0.5 text-[8px] font-black text-cyan-300 tracking-widest uppercase rounded">
                      {product.category || "UNCATEGORIZED"}
                    </div>

                    {/* Scanline hiasan murni game style */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(6,182,212,0.06)_50%,transparent_55%)] bg-size-[100%_8px] pointer-events-none" />
                  </div>

                  {/* METADATA CONTENT AREA */}
                  <div className="p-4 space-y-3 grow">
                    <div>
                      <h5 className="font-black text-white text-sm tracking-wide uppercase truncate group-hover:text-cyan-400 transition-colors">
                        {product.name || "UNNAMED_OBJECT"}
                      </h5>
                      <p className="text-[11px] text-cyan-500/70 line-clamp-2 mt-1 h-8 font-medium">
                        {product.description || "No diagnostic log files provided for this unit asset inventory."}
                      </p>
                    </div>

                    {/* Spek data grid mini dalam card */}
                    <div className="grid grid-cols-2 gap-2 bg-[#010811] p-2 rounded border border-cyan-950/60 text-[10px]">
                      <div>
                        <span className="text-cyan-600/60 block text-[8px] font-black tracking-wider">PRICE</span>
                        <span className="font-bold text-emerald-400 tracking-wide text-xs">
                          {product.price ? `Rp ${Number(product.price).toLocaleString("id-ID")}` : "0"}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-600/60 block text-[8px] font-black tracking-wider">STORE NAME</span>
                        <span className="font-bold text-white uppercase block truncate">
                          {product.seller?.name || "UNKNOWN"}
                        </span>
                      </div>
                      <div className="border-t border-cyan-950/40 pt-1 mt-1">
                        <span className="text-cyan-600/60 block text-[8px] font-black tracking-wider">STOCK</span>
                        <span className="font-bold text-cyan-200">{product.stock ?? 0} UNITS</span>
                      </div>
                      <div className="border-t border-cyan-950/40 pt-1 mt-1">
                        <span className="text-cyan-600/60 block text-[8px] font-black tracking-wider">UNITS SOLD</span>
                        <span className="font-medium text-cyan-400/80 italic">{product.sold ?? 0} sold</span>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTION ACTION PANEL (Sesuai bagian bawah Subnautica News) */}
                  <div className="grid grid-cols-2 border-t border-cyan-950 bg-[#010912] text-center divide-x divide-cyan-950 text-[10px] font-black tracking-widest uppercase">
                    <div className="p-2.5 hover:bg-cyan-500/5 transition-colors flex items-center justify-center">
                      <EditProduct selectedData={product} />
                    </div>
                    <div className="p-2.5 hover:bg-red-500/5 transition-colors flex items-center justify-center">
                      <DeleteProduct selectedData={product} />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* TELEMETRY PACKET PAGINATION FOOTER */}
            <div className="mt-6 bg-[#01070e] p-4 rounded-bl-xl rounded-tr-xl border border-cyan-950 flex justify-between items-center flex-wrap gap-3 text-[11px] text-cyan-600 font-bold">
              <div>
                <Pagination
                  currentPage={page}
                  totalItems={counts}
                  itemsPerPage={limit}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";