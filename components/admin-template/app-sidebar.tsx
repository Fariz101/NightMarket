"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { items } from "@/app/admin/admin_menus";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";

function deleteClientCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin memutuskan sinkronisasi (Logout)?")) {
      deleteClientCookie("token");
      router.push("/");
    }
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r-2 border-cyan-500/30 bg-[#020c1b]/95 text-cyan-100 font-mono shadow-[5px_0_30px_rgba(6,182,212,0.05)]"
    >
      {/* HEADER: PROTOCOL BRANDING */}
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-cyan-950/80 px-4 select-none relative before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-4 before:h-0.5 before:bg-orange-500">
        <div className="text-center">
          <span className="text-4xl font-black tracking-widest text-white cursor-pointer transition-transform duration-200 active:scale-95" onClick={() => router.push('/customer/dashboard')}>
            <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">N</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] group-hover:text-white transition-colors">MARKET</span>
          </span>
          <p className="text-[9px] text-cyan-600 tracking-widest font-bold mt-0.5 uppercase">
            Admin Panel
          </p>
        </div>
      </SidebarHeader>

      {/* KONTEN MENU: INTERFACE HUB */}
      <SidebarContent className="py-6 px-3 bg-[#010812]/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-500/60 px-2 mb-4 block">
              NAVIGATION
          </SidebarGroupLabel>

          <SidebarMenu className="space-y-2">
            {items.map((item) => {
              const isActive =
                pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all relative border ${
                      isActive
                        ? "bg-[#041a30] text-orange-400 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.75 before:bg-orange-500"
                        : "text-cyan-400/80 border-transparent hover:bg-[#021124] hover:text-cyan-200 hover:border-cyan-950"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center w-full gap-3">
                      <item.icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isActive ? "text-orange-400 scale-110 drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]" : "text-cyan-600"
                        }`}
                      />
                      <span className="text-xs uppercase font-bold tracking-wider">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER: COMMAND DISCONNECT */}
      <SidebarFooter className="p-4 border-t border-cyan-950/80 bg-[#01060d]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-transparent hover:bg-red-950/20 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-500/50 rounded transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-500 group-hover:animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Logout
                </span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}