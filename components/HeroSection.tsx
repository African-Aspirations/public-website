import Image from "next/image";
import Breadcrumbs from "./bread-crumbs";
import { Button } from "./ui/button";

const HeroSection = ({
  img,
  title,
  subtitle,
  buttonTitle = "Reach out to us",
  buttonHref = "https://forms.fillout.com/t/oEtePaNuxSus",
}: any) => {
  const [firstWord, ...rest] = title.split(" ");
  const secondPart = rest.join(" ");

  return (
    <div className="w-full bg-[#015A1A]">
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-10 px-4 py-14 md:flex-nowrap md:px-8 md:py-20">
        <div className="flex w-full flex-col gap-5 md:w-[55%]">
          <Breadcrumbs variant="dark" />
          <p className="font-medium text-4xl text-white leading-[1.1] md:text-6xl">
            {firstWord}{" "}
            {secondPart && (
              <span className="text-[#A9D48C]">{secondPart}</span>
            )}
          </p>
          {subtitle && (
            <p className="max-w-xl font-normal text-lg text-white/80 leading-relaxed md:text-xl">
              {subtitle}
            </p>
          )}
          <Button
            onClick={() =>
              window.open(
                buttonHref,
                buttonHref.startsWith("http") ? "_blank" : "_self",
              )
            }
            className="w-fit rounded-full bg-white px-8 py-2 font-bold text-[#015A1A] text-base hover:bg-white/90"
            style={{ fontFamily: "Inter" }}
          >
            {buttonTitle}
          </Button>
        </div>
        <div className="h-[240px] w-full overflow-hidden rounded-2xl md:h-[300px] md:w-[38%]">
          <Image
            width={596}
            height={300}
            src={img}
            alt={title}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
