"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Target,
  Users,
  Shield,
  Lightbulb,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "نظرة عامة", labelEn: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/opportunities", label: "الفرص", labelEn: "Opportunities", icon: Target },
  { href: "/dashboard/prospects", label: "العملاء المحتملون", labelEn: "Prospects", icon: Users },
  { href: "/dashboard/competitors", label: "المنافسون", labelEn: "Competitors", icon: Shield },
  { href: "/dashboard/insights", label: "الرؤى", labelEn: "Insights", icon: Lightbulb },
  { href: "/dashboard/reports", label: "التقارير", labelEn: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "الإعدادات", labelEn: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C8A96B]">
          <span className="text-sm font-bold text-[#0F1115]">T</span>
        </div>
        <div>
          <span className="text-lg font-semibold text-white">تراميز</span>
          <span className="block text-[10px] text-white/40 uppercase tracking-wider">Intelligence</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-[#0E3B2E] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F1115] text-white"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-full w-64 bg-[#0F1115] flex flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
