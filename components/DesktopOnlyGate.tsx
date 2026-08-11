"use client";

import { Monitor } from "lucide-react";

export function DesktopOnlyGate() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#F3F0E8] via-[#F6EFE4] to-[#EFE2D3] p-6 lg:hidden"
      role="dialog"
      aria-label="Desktop required"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2F6B4F]/10">
          <Monitor className="h-6 w-6 text-[#2F6B4F]" strokeWidth={1.75} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Best on desktop
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This app is designed for large screens. For the best experience,
          please open it on a desktop or laptop.
        </p>
      </div>
    </div>
  );
}

export default DesktopOnlyGate;
