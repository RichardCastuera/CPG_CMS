import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function GuidelineRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data: guideline, error } = await supabase
    .from("guidelines")
    .select(
      "id, current_version_id, versions:guideline_versions!guideline_versions_guideline_id_fkey(id, status, created_at)",
    )
    .eq("id", id)
    .single();

  if (error || !guideline) notFound();

  const draft = guideline.versions
    ?.filter((v) => v.status === "draft")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

  const targetVersionId =
    guideline.current_version_id ??
    guideline.versions
      ?.filter((v) => v.status === "draft")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0]?.id ??
    guideline.versions?.[0]?.id;

  if (!targetVersionId) notFound();

  redirect(`/guidelines/${id}/versions/${targetVersionId}`);
}
