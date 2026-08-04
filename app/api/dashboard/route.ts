import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "author";

  // Stat counts — based on each guideline's CURRENT VERSION status, not the
  // parent guidelines.status column, since that can drift out of sync
  // (e.g. seeded/test data, or any write path that doesn't go through the
  // submit_or_publish_guideline / approve_guideline_version RPCs).
  const { data: allGuidelines, error: guidelinesError } = await supabase
    .from("guidelines")
    .select("id, status, current_version_id, guideline_versions!fk_current_version(status, published_at)")
    .neq("status", "archived");

  if (guidelinesError) {
    console.error("[dashboard] failed to load guidelines:", guidelinesError.message);
  }

  const totalActive = allGuidelines?.length ?? 0;

  let inReviewCount = 0;
  let draftCount = 0;
  let publishedThisMonth = 0;
  const startOfMonth = new Date(new Date().setDate(1));

  for (const g of allGuidelines ?? []) {
    const version = Array.isArray(g.guideline_versions) ? g.guideline_versions[0] : g.guideline_versions;
    if (!version) continue;

    if (version.status === "in_review") inReviewCount++;
    if (version.status === "draft") draftCount++;
    if (
      version.status === "published" &&
      version.published_at &&
      new Date(version.published_at) >= startOfMonth
    ) {
      publishedThisMonth++;
    }
  }

  // Needs-attention: role-dependent
  let needsAttention: any[] = [];
  if (role === "admin" || role === "reviewer") {
    const { data, error } = await supabase
      .from("guideline_versions")
      .select("id, version_number, guideline_id, created_at, guidelines!guideline_versions_guideline_id_fkey(title)")
      .eq("status", "in_review")
      .order("created_at", { ascending: true })
      .limit(5);
    if (error) console.error("[dashboard] needsAttention (reviewer) query failed:", error.message);
    needsAttention = data ?? [];
  } else {
    const { data, error } = await supabase
      .from("guideline_versions")
      .select("id, version_number, guideline_id, review_note, guidelines!guideline_versions_guideline_id_fkey(title)")
      .eq("status", "changes_requested")
      .eq("created_by", user.id)
      .limit(5);
    if (error) console.error("[dashboard] needsAttention (author) query failed:", error.message);
    needsAttention = data ?? [];
  }

  // Due for review soon (next_review_date within 30 days, or already past)
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const { data: dueForReview, error: dueForReviewError } = await supabase
    .from("guidelines")
    .select("id, title, next_review_date")
    .not("next_review_date", "is", null)
    .lte("next_review_date", in30Days.toISOString().slice(0, 10))
    .neq("status", "archived")
    .order("next_review_date", { ascending: true })
    .limit(5);

  if (dueForReviewError) {
    console.error("[dashboard] dueForReview query failed:", dueForReviewError.message);
  }

  // Recent activity — last 8 audit log entries
  const { data: recentActivity, error: recentActivityError } = await supabase
    .from("audit_log")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  if (recentActivityError) {
    console.error("[dashboard] recentActivity query failed:", recentActivityError.message);
  }

  return NextResponse.json({
    role,
    stats: {
      totalActive,
      inReview: inReviewCount,
      drafts: draftCount,
      publishedThisMonth,
    },
    needsAttention,
    dueForReview: dueForReview ?? [],
    recentActivity: recentActivity ?? [],
  });
}