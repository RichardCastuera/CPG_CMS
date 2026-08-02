import { Suspense } from "react";
import { CreateGuidelineForm } from "@/components/CreateGuidelineForm";

const NewGuideline = () => {
  return (
    <div className="flex flex-col w-full gap-6">
      <header>
        <h2>Guideline Information</h2>
        <p>
          Provide the essential metadata, ownership details, and clinical focus
          for this guideline.
        </p>
      </header>
      <main>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading form...</p>
          }
        >
          <CreateGuidelineForm />
        </Suspense>
      </main>
    </div>
  );
};

export default NewGuideline;
