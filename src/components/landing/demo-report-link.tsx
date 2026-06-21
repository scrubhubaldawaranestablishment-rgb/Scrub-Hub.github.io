import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui/button";

export const DEMO_REQUEST_ANCHOR = "#demo-request";

type DemoReportLinkProps = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
};

export function DemoReportLink({
  variant = "outline",
  size = "default",
  className,
}: DemoReportLinkProps) {
  return (
    <Link href={DEMO_REQUEST_ANCHOR}>
      <Button variant={variant} size={size} className={className}>
        اطلب تقرير تجريبي
      </Button>
    </Link>
  );
}
