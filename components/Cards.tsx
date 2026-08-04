import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

function StatsCard({
  icon: Icon,
  label,
  value,
  href,
  valueSuffix,
  action,
  iconClassName,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  href?: string;
  valueSuffix?: string;
  action?: React.ReactNode;
  iconClassName?: string;
}) {
  const content = (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={
              iconClassName ?? "rounded-lg bg-[#2F6B4F]/10 p-2 text-[#2F6B4F]"
            }
          >
            <Icon size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {value}
              {valueSuffix && (
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  {valueSuffix}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>

        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default StatsCard;
