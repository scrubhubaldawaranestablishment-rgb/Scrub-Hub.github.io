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
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("border-[#0E3B2E]/8 hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#0F1115]/50 mb-1">{title}</p>
            <p className="text-2xl font-bold text-[#0F1115]">{value}</p>
            {subtitle && (
              <p className="text-xs text-[#0F1115]/40 mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className="text-xs text-[#0E3B2E] mt-2 font-medium">{trend}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E3B2E]/8">
            <Icon className="h-5 w-5 text-[#0E3B2E]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function formatMetricCurrency(amount: number) {
  return formatCurrency(amount);
}
