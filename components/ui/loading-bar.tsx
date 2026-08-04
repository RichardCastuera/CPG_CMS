import { cn } from "@/lib/utils";

/**
 * Thin wrapper around a plain animated div — bypasses shadcn's Skeleton
 * base className entirely so color is never lost to class-merge order.
 * Use this everywhere instead of importing Skeleton directly.
 */
export function LoadingBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#2F6B4F]/15", className)}
    />
  );
}
