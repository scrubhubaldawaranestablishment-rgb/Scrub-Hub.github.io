"use client";

import { useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const loadChannels = useAppStore((s) => s.loadChannels);

  useEffect(() => {
    hydrate().then(() => loadChannels());
  }, [hydrate, loadChannels]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
