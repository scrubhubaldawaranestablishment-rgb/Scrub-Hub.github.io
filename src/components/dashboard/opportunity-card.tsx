"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OpportunityCardProps {
  title: string;
  description: string;
  whyItMatches: string;
  revenuePotential: number;
  confidenceScore: number;
  recommendedAction: string;
  isLocked?: boolean;
}

export function OpportunityCard({
  title,
  description,
  whyItMatches,
  revenuePotential,
  confidenceScore,
  recommendedAction,
  isLocked = false,
}: OpportunityCardProps) {
  if (isLocked) {
    return (
      <Card className="border-[#0E3B2E]/8 relative overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex flex-col items-center justify-center p-6">
          <Lock className="h-8 w-8 text-[#0E3B2E]/40 mb-3" />
          <p className="text-sm font-medium text-[#0F1115]/60 text-center mb-3">
            Upgrade to unlock this opportunity
          </p>
          <Link href="/dashboard/settings">
            <Button size="sm" variant="accent">
              ترقية الخطة
            </Button>
          </Link>
        </div>
        <CardContent className="p-6 blur-sm select-none">
          <div className="h-20 bg-[#0E3B2E]/5 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0E3B2E]/8 hover:border-[#0E3B2E]/20 transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold leading-snug">{title}</CardTitle>
          <div className="flex items-center gap-1 shrink-0 text-[#C8A96B]">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-bold">{confidenceScore}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#0F1115]/70 leading-relaxed">{description}</p>

        <div className="rounded-lg bg-[#F8F7F3] p-3">
          <p className="text-xs font-medium text-[#0E3B2E] mb-1">لماذا تتطابق</p>
          <p className="text-sm text-[#0F1115]/70">{whyItMatches}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#0F1115]/50">إمكانية الإيرادات</p>
            <p className="text-lg font-bold text-[#C8A96B]">
              {formatCurrency(revenuePotential)}
            </p>
          </div>
          <div className="w-24">
            <p className="text-xs text-[#0F1115]/50 mb-1">الثقة</p>
            <Progress value={confidenceScore} className="h-1.5" />
          </div>
        </div>

        <div className="rounded-lg border border-[#0E3B2E]/10 p-3">
          <p className="text-xs font-medium text-[#0E3B2E] mb-1">الإجراء الموصى به</p>
          <p className="text-sm text-[#0F1115]/70">{recommendedAction}</p>
        </div>
      </CardContent>
    </Card>
  );
}
