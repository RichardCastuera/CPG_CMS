import { Image, Table2, Workflow, BarChart3, FileText, LucideIcon } from "lucide-react";
import { ArtifactCategory } from "@/lib/artifacts";

interface CategoryStyle {
  label: string;
  icon: LucideIcon;
  bgClass: string; // header block background
  iconClass: string; // icon color on that background
}

export const ARTIFACT_CATEGORY_STYLES: Record<ArtifactCategory, CategoryStyle> = {
  figure: {
    label: "Figure",
    icon: Image,
    bgClass: "bg-emerald-100",
    iconClass: "text-emerald-700",
  },
  table: {
    label: "Table",
    icon: Table2,
    bgClass: "bg-amber-100",
    iconClass: "text-amber-700",
  },
  flowchart: {
    label: "Flowchart",
    icon: Workflow,
    bgClass: "bg-indigo-100",
    iconClass: "text-indigo-700",
  },
  chart: {
    label: "Chart",
    icon: BarChart3,
    bgClass: "bg-rose-100",
    iconClass: "text-rose-700",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    bgClass: "bg-violet-100",
    iconClass: "text-violet-700",
  },
};