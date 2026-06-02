import { AppSidebar } from "@/components/seller-template/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FloatingTrigger } from "@/components/seller-template/floating-trigger";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-[#071829] text-cyan-50 overflow-hidden">
        {/* Sidebar Kiri */}
        <AppSidebar />
        
        {/* Tombol Panah Melayang diletakkan di sini */}
        <FloatingTrigger />
        
        {/* Area Kanan (Konten Halaman) */}
        <main className="flex-1 overflow-y-auto relative p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}