import { NewGuidelineButton } from "@/components/NewGuidelineButton";

const Reviews = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reviews</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clinical practice guidelines.
            </p>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Reviews;
