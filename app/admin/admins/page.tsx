/* eslint-disable @next/next/no-img-element */
import React from "react";
import { cookies } from "next/headers";
import { Admin } from "@/app/types";
import AddAdmin from "./add";
import EditAdmin from "./edit";
import DeleteAdmin from "./delete";
import Search from "@/components/search";
import Pagination from "@/components/pagination";
import SortButton from "@/components/sort-button"; 
import { User as UserIcon } from "lucide-react";

type ResultData = {
  success: boolean;
  message: string;
  data: Admin[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

async function getAdmins(
  page: number,
  limit: number,
  search: string,
  sortBy: string, 
  sortOrder: string, 
  token: string,
): Promise<{
  success: boolean;
  message: string;
  data: Admin[];
  count: number;
}> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_API_URL}/admin?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseData: ResultData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData?.message || "Unauthorized",
        data: [],
        count: 0,
      };
    }

    const finalCount = responseData.meta?.total ?? (responseData.data ? responseData.data.length : 0);

    return {
      success: responseData.success,
      message: responseData.message,
      data: responseData.data || [],
      count: finalCount,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed", data: [], count: 0 };
  }
}

type Props = {
  searchParams: Promise<{
    page?: string | number;
    limit?: string | number;
    quantity?: string | number;
    search?: string;
    sortBy?: string; 
    sortOrder?: string; 
  }>;
};

export default async function AdminsPage(prop: Props) {
  const resolvedSearchParams = await prop.searchParams;

  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit || resolvedSearchParams?.quantity) || 5;
  const search = resolvedSearchParams?.search || "";
  const sortBy = resolvedSearchParams?.sortBy || ""; 
  const sortOrder = resolvedSearchParams?.sortOrder || "asc"; 

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const { count: counts, data: admins } = await getAdmins(
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    token,
  );

  return (
    <div className="space-y-8 font-mono text-cyan-100 p-2">
      
      {/* HEADER PANEL BERGAYA CONSOLE DATA ARCHIVE */}
      <div className="relative bg-[#031224]/80 backdrop-blur-xl border border-cyan-900/60 p-6 rounded-br-2xl rounded-tl-2xl border-l-4 border-l-orange-500 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
        <div className="flex justify-between items-center text-[9px] tracking-widest text-cyan-500/50 font-black mb-1">
          <span>PAGE // ADMINS CRUD</span>
          <span>DATA COUNT: {counts} ADMINS</span>
        </div>
        <h4 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          ADMINS DATA
        </h4>
        <p className="text-xs text-cyan-500/70 mt-1 uppercase font-bold tracking-wide">
          view and manage admin data, including creating new admins, editing existing ones, and deleting records as needed.
        </p>

        {/* ACTION UTILITY STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-[#010912]/80 p-3 rounded border border-cyan-950">
          <div className="flex items-center w-full max-w-md grow">
            {/* Custom Input Search Styling Override (Handled inside component, but wrapper protected) */}
            <Search search={search} placeholder="SEARCH BY NAME / USERNAME..." />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <AddAdmin />
          </div>
        </div>

        {/* TABLE LABEL HEADER (GRID SYSTEM - LABELS) */}
        <div className="hidden md:grid grid-cols-12 items-center bg-[#01070e] p-4 rounded-tl-md rounded-br-md text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] border border-cyan-950 mt-6 mb-2 gap-4">
          <div className="col-span-3"><span>USERNAME</span></div>
          <div className="col-span-4"><span>EMAIL</span></div>
          <div className="col-span-3 flex items-center gap-1">
            <span>FULL NAME</span>
            <SortButton columnKey="name" /> 
          </div>
          <div className="col-span-2 text-right"><span>ACTIONS</span></div>
        </div>

        {/* DATA CONTAINER AREA */}
        {admins.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-red-500/20 rounded bg-red-950/5 text-center text-red-400 text-xs uppercase tracking-[0.2em] font-black shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]">
            NO ADMIN DATA FOUND!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center bg-[#020b17]/80 backdrop-blur-md border border-cyan-950 p-4 rounded-br-xl rounded-tl-xl hover:border-cyan-500/40 hover:bg-[#03152b]/90 transition-all duration-300 gap-4 font-mono text-xs w-full relative group shadow-[0_3px_10px_rgba(0,0,0,0.4)]"
              >
                {/* ID Tagging Miniatur hiasan */}
                <div className="absolute top-1 right-2 text-[7px] text-cyan-950 font-black group-hover:text-cyan-800 transition-colors">
                  ADM-{admin.id}
                </div>

                {/* 1. CALLSIGN + BIOMETRIC EYE BOX (col-span-3) */}
                <div className="col-span-1 md:col-span-3 flex items-center gap-3 min-w-0">
                  {/* Faceted Micro Frame Photo */}
                  <div className="relative w-9 h-9 rounded-br-md rounded-tl-md overflow-hidden border border-cyan-900 bg-[#010810] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {admin.photo ? (
                      <img
                        src={admin.photo}
                        alt="Avatar"
                        className="w-full h-full object-cover filter brightness-90 contrast-115"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-cyan-600/60 group-hover:text-cyan-400 transition-colors" />
                    )}
                    {/* Laser static HUD overlay scanline */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(6,182,212,0.1)_50%,transparent_55%)] bg-size-[100%_6px] pointer-events-none" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <small className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest block md:hidden mb-0.5">
                      Username
                    </small>
                    <span className="font-bold text-cyan-400 block truncate w-full group-hover:text-cyan-300 transition-colors uppercase">
                      {admin.user?.username || "-"}
                    </span>
                  </div>
                </div>

                {/* 2. MAINFRAME ROUTING EMAIL (col-span-4) */}
                <div className="col-span-1 md:col-span-4 min-w-0">
                  <small className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest block md:hidden mb-0.5">
                    Email
                  </small>
                  <span className="font-medium text-cyan-100/90 block truncate w-full text-xs">
                    {admin.user?.email || "-"}
                  </span>
                </div>

                {/* 3. REGISTERED DEPLOYMENT NAME (col-span-3) */}
                <div className="col-span-1 md:col-span-3 min-w-0">
                  <small className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest block md:hidden mb-0.5">
                    Name
                  </small>
                  <span className="font-black text-white block truncate w-full uppercase tracking-wide">
                    {admin.name || "-"}
                  </span>
                </div>

                {/* 4. ACTIONS INTERACTION CONTROLS (col-span-2) */}
                <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-2 shrink-0 text-right min-w-0 w-full mt-3 md:mt-0 pt-3 md:pt-0 border-t border-cyan-950/60 md:border-t-0">
                  <EditAdmin selectedData={admin} />
                  <span className="text-cyan-950 hidden md:inline">/</span>
                  <DeleteAdmin selectedData={admin} />
                </div>
              </div>
            ))}

            {/* TELEMETRY PACKET PAGINATION FOOTER */}
            <div className="mt-4 bg-[#01070e] p-4 rounded-bl-xl rounded-tr-xl border border-cyan-950 flex justify-between items-center flex-wrap gap-3 text-[11px] text-cyan-600 font-bold">
              
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