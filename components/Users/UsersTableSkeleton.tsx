import { LoadingBar } from "@/components/ui/loading-bar";

export function UsersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <LoadingBar className="h-10 w-full max-w-sm" />

      <div className="overflow-hidden rounded-md border">
        <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
          <LoadingBar className="h-4 w-4 rounded-sm" />
          <LoadingBar className="h-4 w-32" />
          <LoadingBar className="h-4 w-44" />
          <LoadingBar className="ml-auto h-4 w-16" />
          <LoadingBar className="h-4 w-16" />
          <LoadingBar className="h-4 w-20" />
          <LoadingBar className="h-4 w-6" />
        </div>

        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <LoadingBar className="h-4 w-4 rounded-sm" />
            <LoadingBar className="h-4 w-36" />
            <LoadingBar className="h-4 w-48" />
            <LoadingBar className="ml-auto h-5 w-16 rounded-full" />
            <LoadingBar className="h-5 w-16 rounded-full" />
            <LoadingBar className="h-4 w-14" />
            <LoadingBar className="h-6 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
