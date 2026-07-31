import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewGuidelineButtonProps {
  className?: string;
  href: string;
  icon?: React.ReactNode;
  title: string;
}

export function NewGuidelineButton({
  className,
  href,
  icon,
  title,
}: NewGuidelineButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/85 hover:text-white gap-2",
        className,
      )}
    >
      <Link href={href}>
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
      </Link>
    </Button>
  );
}
