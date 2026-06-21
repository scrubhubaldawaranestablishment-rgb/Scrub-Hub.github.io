"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock, TrendingUp, BadgeCheck } from "lucide-react";
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
  rank?: number;
  lockedRevenueHint?: number;
}

export function OpportunityCard({
  title,
  description,
  whyItMatches,
  revenuePotential,
  confidenceScore,
  recommendedAction,
  isLocked = false,
  rank,
  lockedRevenueHint,
}: OpportunityCardProps) {
  if (isLocked) {
    return (
      <Card className="border-[#0E3B2E]/8 relative overflow-hidden bg-[#FAFAF8]">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/75 backdrop-blur-[2px]">
          <Lock className="h-7 w-7 text-[#0E3B2E]/50 mb-3" />
          {lockedRevenueHint ? (
            <p className="text-sm font-semibold text-[#0F1115] text-center mb-1 tabular-nums">
              صفقة بقيمة {formatCurrency(lockedRevenueHint)}+
            </p>
          ) : null}
          <p className="text-xs text-[#0F1115]/55 text-center mb-4 max-w-[200px] leading-relaxed">
            متاحة في خطة النمو — افتح باقي pipeline
          </p>
          <Link href="/dashboard/settings">
            <Button size="sm" variant="accent">
              فتح التقرير الكامل
            </Button>
          </Link>
        </div>
        <CardContent className="p-6 select-none">
          <div className="space-y-3 opacity-40">
            <div className="h-4 bg-[#0E3B2E]/10 rounded w-3/4" />
            <div className="h-3 bg-[#0E3B2E]/5 rounded w-full" />
            <div className="h-8 bg-[#C8A96B]/10 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0E3B2E]/10 hover:border-[#0E3B2E]/25 transition-all hover:shadow-lg hover:shadow-[#0E3B2E]/5 relative">
      {rank && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-[#0E3B2E] px-2.5 py-1 text-[10px] font-bold text-[#C8A96B]">
          <BadgeCheck className="h-3 w-3" />
          فرصة #{rank}
        </div>
      )}
      <CardHeader className="pb-3 pt-10">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-semibold leading-snug text-[#0F1115]">{title}</CardTitle>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-lg font-bold text-[#C8A96B] tabular-nums">
              {formatCurrency(revenuePotential)}
            </span>
            <span className="text-[10px] text-[#0F1115]/45">قيمة الصفقة المتوقعة</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#0F1115]/65 leading-relaxed">{description}</p>

        <div className="rounded-lg bg-[#F8F7F3] border border-[#0E3B2E]/6 p-3">
          <p className="text-xs font-semibold text-[#0E3B2E] mb-1">لماذا تناسب نشاطك</p>
          <p className="text-sm text-[#0F1115]/65 leading-relaxed">{whyItMatches}</p>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-[#0E3B2E] shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#0F1115]/50">احتمال الإغلاق</span>
              <span className="font-bold text-[#0E3B2E] tabular-nums">{confidenceScore}%</span>
            </div>
            <Progress value={confidenceScore} className="h-1.5" />
          </div>
        </div>

        <div className="rounded-lg border border-[#C8A96B]/25 bg-[#C8A96B]/5 p-3">
          <p className="text-xs font-semibold text-[#0E3B2E] mb-1">خطوتك التالية للبيع</p>
          <p className="text-sm text-[#0F1115]/70 leading-relaxed">{recommendedAction}</p>
        </div>
      </CardContent>
    </Card>
  );
}
