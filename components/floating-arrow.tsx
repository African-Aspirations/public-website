import { ChevronDown } from "lucide-react";
import { useRef } from "react";

const FloatingArrow = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={wrapperRef}
      className="group mt-8 flex w-full cursor-pointer justify-center md:mb-[26px]"
      onClick={() => {
        const nextSection = wrapperRef.current?.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollBy({
            top: 250,
            behavior: "smooth",
          });
        }
      }}
    >
      <ChevronDown
        size={39}
        color="#739F46"
        className="animate-float transition-transform duration-300 group-active:translate-y-3 group-active:scale-90"
      />
    </div>
  );
};

export default FloatingArrow;
