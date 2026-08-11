"use client";

import * as motion from "motion/react-client";
import Image from "next/image";
import { useEffect } from "react";
import BottomCTASection from "@/components/bottom-cta-section";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";
import PuzzleHeroSection from "@/components/PuzzleHeroSection";
import { cn } from "@/lib/utils";

const _businessBrokerageServices = [
  {
    id: "african-business-sellers",
    title: "African Business Sellers",
    description:
      "African Marketplace for Business Owners (Sellers) to sell their business or a stake in their business to Investors (Buyers). Through our relationship with Transworld Business Advisors (TBA), the world’s largest business brokerage network, we connect Africans with business opportunities across the globe, providing valuation, marketing, negotiation, and closing support with world-class professionalism.",
    icon: "/new_images/image 9.svg",
  },
  {
    id: "buyers-of-african-businesses",
    title: "Buyers of African Businesses",
    description:
      "We provide access to vetted, cash-flowing African businesses across multiple sectors. Our buyer clients benefit from proprietary listings, verified seller information, and expert guidance through due diligence and negotiations, ensuring each acquisition aligns with their investment goals.",
    icon: "/new_images/image 10.svg",
  },
  {
    id: "africans-looking-to-invest-globally",
    title: "Africans Looking to Invest Globally",
    description: `We help African investors diversify their portfolios internationally through franchise
opportunities, business acquisitions, and cross-border partnerships. Our global network
provides exposure to stable, high-growth markets while offering access to residency-by-
investment and lifestyle benefits.`,
    icon: "/new_images/image 11.svg",
  },
  {
    id: "business-valuation",
    title: "Business Valuation",
    description: `Understanding the true worth of your business is essential for any transaction or
partnership. Our valuation experts combine financial analysis, market benchmarking,
and sector insights to deliver accurate, defensible valuations that position your business
competitively for sale or investment.`,
    icon: "/new_images/image 12.svg",
  },
  {
    id: "pitch-books",
    title: "Pitch Books",
    description: `We craft professional, data-driven investor presentations that tell your business story
with clarity and impact. Each pitch book is tailored to showcase financial strength,
growth potential, and unique market positioning, ensuring your opportunity stands
out to serious investors and buyers.`,
    icon: "/new_images/image 13.svg",
  },
];

const services = [
  {
    eyebrow: "For Sellers",
    title: "For African Business Sellers",
    body: "An African marketplace for business owners to sell their business, or a stake in it, to serious investors. Through our relationship with Transworld Business Advisors — the world's largest business brokerage network — we connect African owners with buyers across the globe.",
    image: "/new_images/image 25.png",
    items: [
      "Reach vetted, capital-ready buyers in global markets",
      "Secure fair valuations & better exits",
      "Receive full support through negotiation to closing",
      "Maximize liquidity from your life’s work",
      "Benefit from tax, legal, and compliance guidance",
    ],
  },
  {
    eyebrow: "For Buyers",
    title: "For Buyers of African Businesses",
    body: "We provide access to vetted, cash-flowing African businesses across multiple sectors. Our buyer clients benefit from proprietary listings, verified seller information, and expert guidance through due diligence and negotiations.",
    image: "/new_images/image 25.png",
    items: [
      "Access curated, high-potential ventures",
      "Get support for due diligence & financing",
      "Expand confidently with trusted local expertise",
      "Acquire stable, cash-flowing businesses",
      "Benefit from end-to-end acquisition support",
    ],
  },
  {
    eyebrow: "For Global Investors",
    title: "Africans Looking to Invest Globally",
    body: "We help African investors diversify their portfolios internationally through franchise opportunities, business acquisitions, and cross-border partnerships, with exposure to stable, high-growth markets.",
    image: "/new_images/image 25.png",
    items: [
      "Invest in vetted international businesses",
      "Enter global markets through secure pathways",
      "Enjoy education, healthcare & lifestyle benefits",
      "Gain residency or citizenship by investment",
      "Earn in strong, stable foreign currencies",
    ],
  },
];

const brokerageStats = [
  { value: "250", label: "Global Offices" },
  { value: "600,000+", label: "Active Investor Network" },
  { value: "1,000+", label: "Global Active Agents" },
];

export default function BusinessBrokeragePage() {
  useEffect(() => {
    // Scroll to specific section if hash is present
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ClientNavbar />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-24 md:pt-20"
      >
        <PuzzleHeroSection
          title="Business Brokerage"
          subtitle="Have you ever considered selling your business?"
          img="/new_images/Union.png"
        />
      </motion.div>

      <div className="w-full bg-white py-16">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center px-4 text-center md:px-8">
          <p className="mb-3 font-semibold text-[#739F46] text-sm uppercase tracking-[0.25em]">
            Our Simple, Confidential Brokerage Process
          </p>
          <h2 className="max-w-3xl font-bold text-2xl text-black leading-snug md:text-4xl">
            Every business owner eventually faces a defining question: what
            comes next?
          </h2>
          <p className="mt-4 max-w-2xl text-[#444] text-base leading-relaxed md:text-lg">
            We help owners prepare for that moment with clarity, positioning,
            and access to serious buyers so that the exit is not rushed,
            reactive, or undervalued.
          </p>
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            src="/new_images/bbn1.png"
            alt="Diagram of the brokerage process"
            className="z-10 mt-10 h-auto w-full max-w-4xl object-contain"
          />
        </div>
      </div>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-bold text-3xl text-black md:text-5xl">
              Built for every side of the deal
            </h2>
            <p className="mt-4 text-[#636466] text-lg leading-relaxed">
              Whether you're selling, buying, or investing across borders, we
              bring the same rigor and the same network to every transaction.
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {services.map((service, index) => {
              const isDark = index % 2 === 0;
              return (
                <div
                  key={service.title}
                  className={cn(
                    "flex flex-col items-center gap-10 rounded-[32px] p-6 md:gap-16 md:p-12 lg:flex-row",
                    index % 2 === 1 && "lg:flex-row-reverse",
                    isDark ? "bg-[#015A1A]" : "bg-white",
                  )}
                >
                  <div className="relative h-64 w-full overflow-hidden rounded-3xl lg:h-[380px] lg:w-1/2">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="w-full lg:w-1/2">
                    <p
                      className={cn(
                        "mb-3 font-semibold text-sm uppercase tracking-[0.25em]",
                        isDark ? "text-[#A9D48C]" : "text-[#739F46]",
                      )}
                    >
                      {service.eyebrow}
                    </p>
                    <h3
                      className={cn(
                        "mb-4 font-bold text-2xl md:text-3xl",
                        isDark ? "text-white" : "text-black",
                      )}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-base leading-relaxed md:text-lg",
                        isDark ? "text-white/80" : "text-[#444]",
                      )}
                    >
                      {service.body}
                    </p>
                    <div className="space-y-3">
                      {service.items.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                              isDark ? "bg-[#A9D48C]" : "bg-[#739F46]",
                            )}
                          />
                          <span
                            className={cn(
                              "text-base leading-relaxed",
                              isDark ? "text-white/90" : "text-[#333]",
                            )}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pb-20 md:px-8">
        <div className="rounded-[32px] border border-[#DCEBC8] bg-white p-10 md:p-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <Image
              src="/new_images/TBALogo_origin.webp"
              alt="Transworld Business Advisors logo"
              width={200}
              height={60}
              className="mb-6 w-[160px] object-contain md:w-[200px]"
            />
            <h3 className="font-bold text-2xl text-black md:text-4xl">
              Backed by the world's largest business brokerage network
            </h3>
            <p className="mt-4 text-[#636466] leading-relaxed">
              We operate Transworld Business Advisors Ghana — the Master
              Franchise for Africa.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {brokerageStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-bold text-4xl text-[#015A1A] md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[#636466] text-sm uppercase tracking-[0.15em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* <div className="w-full -mt-32 hidden md:flex">
        <Image
          src={"/new_images/Meliuk-liuk.svg"}
          width={235}
          height={235}
          alt="AA line"
          className="w-full "
        />
      </div> */}

      {/* Services Grid */}
      {/* <section className="bg-white py-20 px-4 sm:px-6 lg:px-16">
        <div className="lg:px-16 ">
          <h2
            className="text-[#1E1E1E]  text-4xl sm:text-5xl font-light mb-12 max-w-[950px]"
            style={{
              fontFamily: "Inter",
            }}
          >
            Brokerage opportunities available with African{" "}
            <span className="text-[#FFC72C] font-normal">Aspirations</span>
          </h2>

          <div className="space-y-8">
            {businessBrokerageServices.map((item) => (
              <div
                id={item?.id}
                key={item?.id}
                className="border-l border-r border-t border-b border-[#FFC72C] p-6 sm:p-8 rounded-lg"
              >
                <div className="flex flex-wrap md:flex-nowrap items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-40 h-full">
                      <Image
                        src={item.icon as string}
                        width={100}
                        height={100}
                        alt={item?.description}
                        className="w-40 h-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="text-3xl font-bold text-[#1E1E1E] mb-2"
                      style={{ fontFamily: "Inter" }}
                    >
                      {item?.title}
                    </h3>
                    <p className="text-[#757575] text-xl font-normal mb-4">
                      {item?.description}
                    </p>
                    <a
                      style={{
                        fontFamily: "Inter",
                      }}
                      href="#"
                      className="inline-flex items-center text-xl font-light text-[#303030] hover:text-[#FFC72C] transition-colors"
                    >
                      Learn more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-9 w-9 text-[#FFC72C]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17.5 8l4.5 4-4.5 4M3 12h18"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* <BottomHero
        backgroundImage="/new_images/156.png"
        title="We are experts at Institutionalization"
        buttonTitle="Leave us a message"
      /> */}
      <BottomCTASection
        question="Exit on your own terms"
        buttonText="Contact Us"
        backgroundImage={"/new_images/7.jpg"}
        link={"https://forms.fillout.com/t/oEtePaNuxSus"}
      />

      <Footer />
    </div>
  );
}
