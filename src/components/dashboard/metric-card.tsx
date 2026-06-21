import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  highlight?: boolean;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, highlight }: MetricCardProps) {
  return (
    <Card className={cn(
      "border-[#0E3B2E]/8 hover:shadow-md transition-shadow",
      highlight && "border-[#C8A96B]/30 bg-[#C8A96B]/5",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#0F1115]/50 mb-1">{title}</p>
            <p className={cn(
              "text-2xl font-bold tabular-nums",
              highlight ? "text-[#0E3B2E]" : "text-[#0F1115]"
            )}>{value}</p>
            {subtitle && (
              <p className="text-xs text-[#0F1115]/45 mt-1.5">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-[#0E3B2E] mt-2 font-medium">{trend}</p>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            highlight ? "bg-[#0E3B2E]" : "bg-[#0E3B2E]/8"
          )}>
            <Icon className={cn("h-5 w-5", highlight ? "text-[#C8A96B]" : "text-[#0E3B2E]")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatMetricCurrency(amount: number) {
  return formatCurrency(amount);
}
