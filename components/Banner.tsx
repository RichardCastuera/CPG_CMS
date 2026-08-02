"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGuidelineChoice } from "@/components/CreateGuidelineChoice";

const Banner = () => {
  const [choiceOpen, setChoiceOpen] = useState(false);

  return (
    <div className="relative w-full mt-20">
      <Image
        src="/CPG_mascot.png"
        alt="CPG mascot"
        height={169}
        width={163}
        className="absolute -top-21 left-8 z-10"
      />
      <div className="flex w-full items-end justify-end px-8 py-6 bg-[#2F6B4F] rounded-xl">
        <Button
          onClick={() => setChoiceOpen(true)}
          className="gap-2 bg-[#2F6B4F] text-white hover:bg-amber-50/25 hover:text-white"
        >
          <Plus size={24} />
          New Guideline
        </Button>
      </div>

      <CreateGuidelineChoice open={choiceOpen} onOpenChange={setChoiceOpen} />
    </div>
  );
};

export default Banner;
