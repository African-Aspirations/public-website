import Breadcrumbs from "./bread-crumbs";
import { Button } from "./ui/button";

const PuzzleHeroSection = ({ img, title, subtitle }: any) => {
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
              window.open("https://forms.fillout.com/t/oEtePaNuxSus", "_blank")
            }
            className="w-fit rounded-full bg-white px-8 py-2 font-bold text-[#015A1A] text-base hover:bg-white/90"
            style={{ fontFamily: "Inter" }}
          >
            Reach out to us
          </Button>
        </div>

        <div className="flex h-[240px] w-full items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-6 md:h-[300px] md:w-[38%]">
          <img src={img} alt={title} className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default PuzzleHeroSection;
