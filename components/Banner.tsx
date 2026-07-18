import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        <Link href={"/guidelines/create_guideline"}>
          <Button
            variant="outline"
            className="bg-[#2F6B4F] text-white hover:bg-amber-50/25 hover:text-white"
          >
            <Plus height={24} width={24} className="text-white" />
            New guideline
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
