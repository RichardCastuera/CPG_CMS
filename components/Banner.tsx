import Image from "next/image";
import { NewGuidelineButton } from "./NewGuidelineButton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const Banner = () => {
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
        <NewGuidelineButton
          className="bg-[#2F6B4F] text-white hover:bg-amber-50/25 hover:text-white"
          href={"/guidelines/create_guideline"}
          title={"New Guideline"}
          icon={<Plus size={24}></Plus>}
        />
      </div>
    </div>
  );
};

export default Banner;
