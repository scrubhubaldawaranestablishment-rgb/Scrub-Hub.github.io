"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, hydrate } = useAppStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token && !user) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;
      if (!stored) {
        router.push("/login");
      }
    }
  }, [user, token, router]);

  if (!user && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
