// app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardCheck,
  FileEdit,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  History,
  FilePlus,
  Send,
  CheckCircle2 as CheckCircleIcon,
  MessageSquareWarning,
  MessageSquare,
  UserPlus,
  Archive,
  Trash2,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoadingBar } from "@/components/ui/loading-bar";
import { formatRelativeShort } from "@/lib/formatRelativeShort";
import Banner from "@/components/Banner";

interface DashboardData {
  role: "admin" | "author" | "reviewer";
  stats: {
    totalActive: number;
    inReview: number;
    drafts: number;
    publishedThisMonth: number;
  };
  needsAttention: any[];
  dueForReview: { id: string; title: string; next_review_date: string }[];
  recentActivity: {
    id: string;
    created_at: string;
    action: string;
    target: string;
    profiles: { name: string } | null;
  }[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon size={18} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function getActivityIcon(action: string) {
  if (action.includes("created"))
    return { icon: FilePlus, className: "bg-blue-100 text-blue-700" };
  if (action.includes("submitted"))
    return { icon: Send, className: "bg-amber-100 text-amber-700" };
  if (action.includes("published") && action.includes("bypass"))
    return { icon: ShieldCheck, className: "bg-violet-100 text-violet-700" };
  if (action.includes("published"))
    return {
      icon: CheckCircleIcon,
      className: "bg-emerald-100 text-emerald-700",
    };
  if (action.includes("changes"))
    return {
      icon: MessageSquareWarning,
      className: "bg-rose-100 text-rose-700",
    };
  if (action.includes("commented"))
    return { icon: MessageSquare, className: "bg-sky-100 text-sky-700" };
  if (action.includes("invited"))
    return { icon: UserPlus, className: "bg-indigo-100 text-indigo-700" };
  if (action.includes("archived"))
    return { icon: Archive, className: "bg-slate-100 text-slate-600" };
  if (action.includes("removed") || action.includes("deleted"))
    return { icon: Trash2, className: "bg-red-100 text-red-700" };
  return { icon: Pencil, className: "bg-gray-100 text-gray-600" };
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StatCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <LoadingBar className="h-9 w-9 rounded-lg" />
        <div className="space-y-2">
          <LoadingBar className="h-6 w-10" />
          <LoadingBar className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

function ListCardSkeleton({
  titleWidth = "w-40",
  rows = 3,
}: {
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <LoadingBar className="h-4 w-4 rounded-sm" />
        <LoadingBar className={`h-4 ${titleWidth}`} />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-md border p-3">
            <LoadingBar className="h-4 w-3/5" />
            <LoadingBar className="h-3 w-2/5" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-2 py-2.5">
      <LoadingBar className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <LoadingBar className="h-4 w-2/5" />
        <LoadingBar className="h-3 w-3/5" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LoadingBar className="h-3 w-10" />
        <LoadingBar className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton titleWidth="w-36" rows={3} />
        <ListCardSkeleton titleWidth="w-28" rows={3} />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <LoadingBar className="h-4 w-4 rounded-sm" />
          <LoadingBar className="h-4 w-32" />
        </div>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </div>
      </Card>
    </>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  const isReviewerOrAdmin = data?.role === "admin" || data?.role === "reviewer";

  return (
    <div className="space-y-6 p-6">
      <Banner />

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={BookOpen}
              label="Active guidelines"
              value={data.stats.totalActive}
              href="/guidelines"
            />
            <StatCard
              icon={ClipboardCheck}
              label="In review"
              value={data.stats.inReview}
              href="/reviews"
            />
            <StatCard
              icon={FileEdit}
              label="Drafts"
              value={data.stats.drafts}
              href="/guidelines"
            />
            <StatCard
              icon={CheckCircle2}
              label="Published this month"
              value={data.stats.publishedThisMonth}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} className="text-amber-600" />
                {isReviewerOrAdmin
                  ? "Pending your review"
                  : "Needs your attention"}
              </h2>
              {data.needsAttention.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="All caught up"
                  description={
                    isReviewerOrAdmin
                      ? "Nothing waiting on your review right now."
                      : "No changes requested on your guidelines."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {data.needsAttention.map((item) => (
                    <Link
                      key={item.id}
                      href={`/guidelines/${item.guideline_id}/versions/${item.id}`}
                      className="block rounded-md border p-3 hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium">
                        {item.guidelines?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.version_number}
                        {item.review_note &&
                          ` · "${item.review_note.slice(0, 60)}${item.review_note.length > 60 ? "..." : ""}"`}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              {isReviewerOrAdmin && data.needsAttention.length > 0 && (
                <Link
                  href="/reviews"
                  className="mt-3 inline-block text-xs text-emerald-700 hover:underline"
                >
                  View all reviews →
                </Link>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <CalendarClock size={16} className="text-blue-600" />
                Due for review
              </h2>
              {data.dueForReview.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="Nothing on the horizon"
                  description="No guidelines due for review in the next 30 days."
                />
              ) : (
                <div className="space-y-2">
                  {data.dueForReview.map((g) => {
                    const isPastDue = new Date(g.next_review_date) < new Date();
                    return (
                      <Link
                        key={g.id}
                        href={`/guidelines/${g.id}/versions`}
                        className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                      >
                        <p className="text-sm font-medium">{g.title}</p>
                        <span
                          className={`text-xs font-medium ${isPastDue ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {isPastDue
                            ? "Past due"
                            : new Date(g.next_review_date).toLocaleDateString()}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <History size={16} className="text-muted-foreground" />
              Recent activity
            </h2>

            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-1">
                {data.recentActivity.map((entry) => {
                  const { icon: ActionIcon, className } = getActivityIcon(
                    entry.action,
                  );
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${className}`}
                      >
                        <ActionIcon size={14} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">
                          <span className="font-medium">
                            {entry.profiles?.name ?? "Unknown"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {entry.action}
                          </span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.target}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeShort(entry.created_at)}
                        </span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F6B4F]/10 text-[10px] font-medium text-[#2F6B4F]">
                          {initials(entry.profiles?.name)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/logs"
              className="mt-3 inline-block text-xs text-emerald-700 hover:underline"
            >
              View full audit log →
            </Link>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#2F6B4F]/10 p-2 text-[#2F6B4F]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
