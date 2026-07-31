"use client";

import Branding from "./Branding";
import { Button } from "./ui/button";
import {
  Send,
  CloudCheck,
  Cloud,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface NavbarProps {
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: Date | null;
  guidelineType?: "Compendium" | "Interim"; // drives the primary action's label/behavior
  onSubmitOrPublish?: () => void | Promise<void>;
  onOpenGuidelineInfo?: () => void;
  isSubmitting?: boolean;
  publishDisabled?: boolean;
}

const AutosaveIndicator = ({
  status,
  lastSavedAt,
}: {
  status: AutosaveStatus;
  lastSavedAt?: Date | null;
}) => {
  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? lastSavedAt
          ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : "Saved"
        : status === "error"
          ? "Failed to save"
          : "";

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        status === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {status === "saving" && <Loader2 size={16} className="animate-spin" />}
      {status === "saved" && <CloudCheck size={16} />}
      {status === "error" && <Cloud size={16} />}
      <span>{label}</span>
    </div>
  );
};

const Navbar = ({
  autosaveStatus = "idle",
  lastSavedAt,
  guidelineType,
  onSubmitOrPublish,
  onOpenGuidelineInfo,
  isSubmitting = false,
  publishDisabled = false,
}: NavbarProps) => {
  // Compendium guidelines are already externally vetted, so the primary
  // action publishes immediately. Interim guidelines require review, so
  // the same button submits for review instead. See submit_or_publish_guideline().
  const isCompendium = guidelineType === "Compendium";
  const actionLabel = isCompendium ? "Publish" : "Submit for review";
  const actionLabelLoading = isCompendium ? "Publishing..." : "Submitting...";

  return (
    <>
      <nav className="flex items-center justify-between py-2 mx-6 bg-white">
        <Branding />
        <div className="flex items-center gap-4">
          <AutosaveIndicator
            status={autosaveStatus}
            lastSavedAt={lastSavedAt}
          />

          <Button
            variant="outline"
            onClick={onOpenGuidelineInfo}
            className="gap-2"
          >
            <SlidersHorizontal size={16} />
            Guideline info
          </Button>

          <div className="h-full w-px bg-gray-800"></div>

          {/* This will be made available once reviewer is established. Focus on admin tasks first */}
          {/* <Button variant={"outline"} className={"gap-4"}>
          <SquarePen size={24} />
          Review
        </Button> */}

          <Button
            className="gap-2 bg-[#2F6B4F] hover:bg-[#2F6B4F]/95"
            onClick={onSubmitOrPublish}
            disabled={isSubmitting || publishDisabled}
          >
            {isSubmitting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Send size={24} />
            )}
            {isSubmitting ? actionLabelLoading : actionLabel}
          </Button>
        </div>
      </nav>
      <hr />
    </>
  );
};

export default Navbar;
