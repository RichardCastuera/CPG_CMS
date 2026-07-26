import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewGuidelineButtonProps {
  className?: string;
}

export function NewGuidelineButton({ className }: NewGuidelineButtonProps) {
  return (
    <Link href="/guidelines/create_guideline">
      <Button
        variant="outline"
        className={cn(
          "bg-[#2F6B4F] text-white hover:bg-[#2F6B4F]/85 hover:text-white",
          className,
        )}
      >
        <Plus height={24} width={24} className="text-white" />
        New guideline
      </Button>
    </Link>
  );
}
