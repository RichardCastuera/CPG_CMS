"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { CreateGuidelineForm } from "@/components/CreateGuidelineForm";

const NewGuideline = () => {
  const router = useRouter();

  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guideline Information</h1>
            <p className="text-sm text-muted-foreground">
              Provide the essential metadata, ownership details, and clinical
              focus for this guideline.
            </p>
          </div>
        </header>
      </div>
      <main>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading form...</p>
          }
        >
          <CreateGuidelineForm onCancel={() => router.push("/guidelines")} />
        </Suspense>
      </main>
    </div>
  );
};

export default NewGuideline;
