"use client";

import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface Leader {
  id: number;
  name: string;
  title: string;
  image: string;
  credentials?: string;
  description?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  bio4?: string;
  imageAlt: string;
}

interface LeadershipCardProps {
  leader: Leader;
  isExpanded: boolean;
  onToggle: () => void;
}

export function LeadershipCard({
  leader,
  isExpanded,
  onToggle,
}: LeadershipCardProps) {
  const {
    image,
    imageAlt,
    name,
    title,
    bio1,
    bio2,
    bio3,
    bio4,
    credentials,
    description,
  } = leader;

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-[20px] transition-all duration-300 hover:scale-[1.01]">
        <div className="group relative h-80 w-full overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex h-[94px] flex-1 flex-col bg-[#fff] p-6">
          <h3
            className="mb-[2px] overflow-hidden text-ellipsis whitespace-nowrap font-bold text-[#0C0D0C] text-xl"
            style={{ fontFamily: "Inter" }}
          >
            {name}
          </h3>
          <p
            className="flex-1 font-normal text-[#0C0D0C] text-sm"
            style={{ fontFamily: "Inter" }}
          >
            {title}
          </p>

          <button
            onClick={onToggle}
            className="flex items-end justify-end self-end rounded-fullw-fit border-2 border-[#fff] bg-transparent text-[#fff] hover:bg-transparent hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
            >
              <title>arrow_right_circle_line</title>
              <g id="arrow_right_circle_line" fill="none" fillRule="nonzero">
                <path d="M24 0v24H0V0h24ZM12.594 23.258l-.012.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.105.074.014.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.016-.018Zm.264-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.008.201.092c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.092.01-.009.004-.011.017-.43-.003-.012-.01-.01-.184-.092Z" />
                <path
                  fill="#739F46"
                  d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.005 3.758a1 1 0 0 1 1.32-.084l.094.084 3.535 3.535a1 1 0 0 1 .083 1.32l-.083.094-3.535 3.536a1 1 0 0 1-1.498-1.32l.084-.094 1.828-1.83H7.757a1 1 0 0 1-.116-1.992L7.757 11h6.076l-1.828-1.828a1 1 0 0 1 0-1.414Z"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>

      <Dialog
        open={isExpanded}
        onOpenChange={(open) => {
          if (!open) onToggle();
        }}
      >
        <DialogContent className="w-[92vw] max-w-4xl gap-0 overflow-hidden rounded-[20px] border-none bg-white p-0 shadow-2xl">
          <div className="flex max-h-[85vh] flex-col overflow-y-auto md:flex-row">
            <div className="relative h-64 w-full shrink-0 md:h-auto md:w-96">
              <Image
                src={image || "/placeholder.svg"}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 bg-white p-6 md:p-8">
              <h3
                className="mb-1 font-bold text-[#0C0D0C] text-xl md:text-2xl"
                style={{ fontFamily: "Inter" }}
              >
                {name}{" "}
                <span className="ml-1 font-bold text-[#739F46] text-xs">
                  {credentials}
                </span>
              </h3>
              <p
                className="mb-6 font-normal text-[#0C0D0C] text-sm md:text-base"
                style={{ fontFamily: "Inter" }}
              >
                {title}
              </p>
              <p
                className="mb-4 font-bold text-[#739F46] text-xs leading-relaxed md:text-[15px]"
                style={{ fontFamily: "Inter" }}
              >
                {description}
              </p>
              <p
                className="mb-4 font-normal text-[#000000] text-[10px] leading-relaxed md:text-xs"
                style={{ fontFamily: "Inter" }}
              >
                {bio1}
              </p>
              <p
                className="mb-4 font-normal text-[#000000] text-[10px] leading-relaxed md:text-xs"
                style={{ fontFamily: "Inter" }}
              >
                {bio2}
              </p>
              <p
                className="mb-4 font-normal text-[#000000] text-[10px] leading-relaxed md:text-xs"
                style={{ fontFamily: "Inter" }}
              >
                {bio3}
              </p>
              <p
                className="mb-4 font-normal text-[#000000] text-[10px] leading-relaxed md:text-xs"
                style={{ fontFamily: "Inter" }}
              >
                {bio4}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
