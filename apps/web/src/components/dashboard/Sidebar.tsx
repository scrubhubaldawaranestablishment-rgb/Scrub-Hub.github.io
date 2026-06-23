"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  BarChart3,
  Link2,
  Settings,
  Sparkles,
  Menu,
  X,
  Shield,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trends", label: "Trend Research", icon: TrendingUp },
  { href: "/dashboard/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/dashboard/content", label: "Content Pipeline", icon: FileText },
  { href: "/dashboard/schedule", label: "Scheduling", icon: Clock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, channels, activeChannel, setActiveChannel, logout } = useAppStore();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">CreatorPilot</span>
          </Link>
        </div>

        {channels.length > 0 && (
          <div className="p-4 border-b">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Channel</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={activeChannel?.id || ""}
              onChange={(e) => {
                const ch = channels.find((c) => c.id === e.target.value);
                if (ch) setActiveChannel(ch);
              }}
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname.startsWith("/admin")
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t space-y-2">
          <p className="text-xs text-slate-500 px-2 truncate">{user?.email}</p>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
