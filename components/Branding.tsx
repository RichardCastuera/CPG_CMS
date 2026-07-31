import Image from "next/image";
import Link from "next/link";

const Branding = () => {
  return (
    <Link href="/guidelines">
      <div className="flex items-center gap-2">
        <Image src="/CPG_logo.png" alt="CPG-CMS Logo" width={44} height={44} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h2 className="text-base font-bold leading-none">CPG-CMS</h2>
            <span className="flex bg-[#2F6B4F]/15 rounded-full px-2 py-1 ml-1 border border-[#2F6B4F]/40">
              <span className="text-[10px] font-semibold text-[#2F6B4F]">
                ADMIN
              </span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Clinical Practice Guideline
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Branding;
