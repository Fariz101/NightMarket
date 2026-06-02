"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function CategoryFilter({ category }: { category: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.set("page", "1"); 
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative min-w-[170px] w-full sm:w-auto font-mono">
      <select
        value={category || "ALL"}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="w-full bg-[#010912] border border-cyan-900 text-cyan-300 text-xs rounded-tl-md rounded-br-md p-2 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer transition-all"
      >
        <option value="ALL" className="bg-[#020b17] text-white">ALL CATEGORIES</option>
        <option value="ELECTRONICS" className="bg-[#020b17] text-white">ELECTRONICS</option>
        <option value="FASHION" className="bg-[#020b17] text-white">FASHION</option>
        <option value="TOYS" className="bg-[#020b17] text-white">TOYS</option>
        <option value="HOME" className="bg-[#020b17] text-white">HOME</option>
        <option value="HEALTH" className="bg-[#020b17] text-white">HEALTH</option>
        <option value="SPORTS" className="bg-[#020b17] text-white">SPORTS</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-orange-500 text-[8px]">
        ▼
      </div>
    </div>
  );
}