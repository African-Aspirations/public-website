"use client";

import * as motion from "motion/react-client";
import { useEffect, useState } from "react";
import BottomHero from "@/components/BottomHero";
import ClientNavbar from "@/components/client-navbar";
import ConsultingCard, {
  type ConsultingCardProps,
} from "@/components/consulting-card";
import Footer from "@/components/footer";
import HeroSection from "@/components/HeroSection";

const _businessFundingServices = [
  {
    id: "private-equity",
    title: "Private Equity",
    description: `We connect established African businesses with private equity investors seeking
scalable opportunities. Our team supports the entire process, from deal preparation
and structuring to negotiation and closing, to ensure mutually beneficial outcomes.`,
    icon: "/new_images/image 8.svg",
  },
  {
    id: "private-debt",
    title: "Private Debt",
    description: `We arrange flexible debt instruments tailored to the borrower’s cash flow and growth
plans. By working closely with private lenders and debt funds, we secure financing that
balances capital efficiency with sustainability.`,
    icon: "/new_images/image 9.svg",
  },

  {
    id: "venture-capital",
    title: "Venture Capital",
    description: `We help early and growth-stage companies access venture funding that accelerates
innovation and market expansion. Our role includes investor matching, pitch
preparation, and deal structuring to position startups for success.`,
    icon: "/new_images/image 7.svg",
  },
  {
    id: "family-offices",
    title: "Family Offices",
    description: `Through our relationships with global family offices, we provide access to long-term,
patient capital. We align businesses with family investors who share similar values,
investment horizons, and strategic interests.`,
    icon: "/new_images/image 10.svg",
  },
  {
    id: "development-finance",
    title: "Development Finance",
    description: `We partner with Development Finance Institutions (DFIs) and impact investors to fund
projects that drive inclusive growth across Africa. Our team assists with proposal
preparation, compliance, and investment readiness.`,
    icon: "/new_images/image 11.svg",
  },
  {
    id: "public-sector",
    title: "Public sector",
    description: `We collaborate with government agencies and public-private partnership (PPP)
programs to design and finance large-scale infrastructure and social projects. Our
experience ensures transparency, efficiency, and developmental impact.`,
    icon: "/new_images/image 12.svg",
  },
  {
    id: "crowdfunding",
    title: "Crowdfunding",
    description: `We help entrepreneurs tap into collective financing opportunities by connecting them
with credible crowdfunding platforms. Our process ensures compliance, investor
protection, and clear communication of the business case.`,
    icon: "/new_images/image 13.svg",
  },
];

const fundingPhases = [
  {
    title: "Investor Readiness",
    copy: "If you're not yet ready to raise, we work directly with your leadership team to strengthen investment readiness — sharpening financial clarity, business structure, and positioning until you meet investor expectations.",
  },
  {
    title: "Capital Raise",
    copy: "Once you're investment-ready, we facilitate targeted engagement with the capital providers who actually fit your mandate, sector, and transaction requirements — not a mass mailout to whoever will listen.",
  },
];

const fundingCards: Omit<ConsultingCardProps, "isExpanded" | "onToggle">[] = [
  {
    id: 0,
    title: "Private Equity",
    description: `We connect established African businesses with private equity investors seeking
scalable opportunities. Our team supports the entire process, from deal preparation
and structuring to negotiation and closing, to ensure mutually beneficial outcomes.`,
    image: "/new_images/68adea73590669a19f87111d_biz-img-1.webp.png",
    imageAlt: "Team collaboration",
    expandedDescription:
      "We work with established, cash-generative businesses ready to bring in an institutional partner for growth capital or a partial exit.",
    details: [
      {
        title: "Deal Preparation:",
        description:
          "Structuring your business and materials for institutional investors.",
        color: "green",
      },
      {
        title: "Investor Matching:",
        description:
          "Connecting you with PE investors aligned to your sector and stage.",
        color: "gray",
      },
      {
        title: "Negotiation & Closing:",
        description: "Guiding terms through to a mutually beneficial close.",
        color: "gold",
      },
    ],
  },
  {
    id: 1,
    title: "Private Debt",
    description: `We arrange flexible debt instruments tailored to the borrower’s cash flow and growth
plans. By working closely with private lenders and debt funds, we secure financing that
balances capital efficiency with sustainability.`,
    image: "/new_images/2.jpg",
    imageAlt: "Business professional",
    expandedDescription:
      "We structure debt facilities that fund growth without giving up equity, matched to lenders who understand African markets.",
    details: [
      {
        title: "Instrument Structuring:",
        description:
          "Designing debt terms that match your cash flow and growth plans.",
        color: "green",
      },
      {
        title: "Lender Access:",
        description:
          "Connections to private lenders and debt funds across the region.",
        color: "gray",
      },
      {
        title: "Capital Efficiency:",
        description: "Balancing leverage with long-term sustainability.",
        color: "gold",
      },
    ],
  },
  {
    id: 2,
    title: "Venture Capital",
    description: `We help early and growth-stage companies access venture funding that accelerates
innovation and market expansion. Our role includes investor matching, pitch
preparation, and deal structuring to position startups for success.`,
    image: "/new_images/14.jpg",
    imageAlt: "Construction professional",
    expandedDescription:
      "We help founders raise from investors who back early and growth-stage companies, from first pitch through to a signed term sheet.",
    details: [
      {
        title: "Investor Matching:",
        description:
          "Connecting founders to VCs aligned with their stage and sector.",
        color: "green",
      },
      {
        title: "Pitch Preparation:",
        description:
          "Sharpening your story and materials for investor scrutiny.",
        color: "gray",
      },
      {
        title: "Deal Structuring:",
        description:
          "Structuring terms that protect founders and attract capital.",
        color: "gold",
      },
    ],
  },
  {
    id: 3,
    title: "Family Offices",
    description: `Through our relationships with global family offices, we provide access to long-term,
patient capital. We align businesses with family investors who share similar values,
investment horizons, and strategic interests.`,
    image: "/new_images/8.jpg",
    imageAlt: "Construction professional",
    expandedDescription:
      "We connect businesses with family offices looking for long-term, values-aligned investments rather than a quick exit.",
    details: [
      {
        title: "Patient Capital:",
        description:
          "Access to long-term funding without short exit pressure.",
        color: "green",
      },
      {
        title: "Values Alignment:",
        description: "Matched with family investors who share your outlook.",
        color: "gray",
      },
      {
        title: "Global Reach:",
        description:
          "Relationships spanning family offices across multiple regions.",
        color: "gold",
      },
    ],
  },
  {
    id: 4,
    title: "Development Finance",
    description: `We partner with Development Finance Institutions (DFIs) and impact investors to fund
projects that drive inclusive growth across Africa. Our team assists with proposal
preparation, compliance, and investment readiness.`,
    image: "/new_images/16.jpg",
    imageAlt: "Construction professional",
    expandedDescription:
      "We help businesses with a clear development or impact case access funding from DFIs and impact investors.",
    details: [
      {
        title: "DFI Access:",
        description:
          "Direct relationships with Development Finance Institutions and impact funds.",
        color: "green",
      },
      {
        title: "Proposal Preparation:",
        description: "Building the case your funder needs to see.",
        color: "gray",
      },
      {
        title: "Compliance & Readiness:",
        description: "Meeting the governance standards DFIs require.",
        color: "gold",
      },
    ],
  },
  {
    id: 5,
    title: "Public Sector",
    description: `We collaborate with government agencies and public-private partnership (PPP)
programs to design and finance large-scale infrastructure and social projects. Our
experience ensures transparency, efficiency, and developmental impact.`,
    image: "/new_images/17.jpg",
    imageAlt: "Construction professional",
    expandedDescription:
      "We help structure and finance projects that combine public agency backing with private capital.",
    details: [
      {
        title: "PPP Structuring:",
        description:
          "Designing partnerships between public agencies and private capital.",
        color: "green",
      },
      {
        title: "Transparency & Governance:",
        description:
          "Meeting the accountability standards public funding requires.",
        color: "gray",
      },
      {
        title: "Developmental Impact:",
        description:
          "Financing structured around measurable public benefit.",
        color: "gold",
      },
    ],
  },
  {
    id: 6,
    title: "Crowdfunding",
    description: `We help entrepreneurs tap into collective financing opportunities by connecting them
with credible crowdfunding platforms. Our process ensures compliance, investor
protection, and clear communication of the business case.`,
    image: "/new_images/13.jpg",
    imageAlt: "Construction professional",
    expandedDescription:
      "We help businesses raise from the crowd the right way, on platforms that are actually credible and compliant.",
    details: [
      {
        title: "Platform Access:",
        description: "Connections to credible, vetted crowdfunding platforms.",
        color: "green",
      },
      {
        title: "Investor Protection:",
        description:
          "Compliance built in to protect backers and the business.",
        color: "gray",
      },
      {
        title: "Clear Communication:",
        description: "A business case investors can understand and trust.",
        color: "gold",
      },
    ],
  },
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

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

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

        <HeroSection
          title="Business Funding"
          subtitle="Capital matched to businesses that are actually ready for it."
          img="/new_images/image 16.png"
        />
      </motion.div>

      <section className="mx-auto max-w-[90rem] px-4 py-16 md:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 font-semibold text-[#739F46] text-sm uppercase tracking-[0.25em]">
            How we support you
          </p>
          <h2 className="font-bold text-3xl text-black md:text-4xl">
            We only make the introduction when there's real alignment.
          </h2>
          <p className="mt-4 text-[#636466] text-lg leading-relaxed">
            We improve the odds of a successful raise by matching capital to
            businesses that actually meet investor criteria — not before.
            Our logic is simple: we win only when you win.
          </p>
        </div>
        <div className="rounded-[32px] bg-[#015A1A] p-8 text-white md:p-12">
          <div className="grid gap-6 md:grid-cols-2">
            {fundingPhases.map((phase, index) => (
              <div
                key={phase.title}
                className="rounded-[24px] border border-white/20 bg-white/10 p-6"
              >
                <p className="mb-3 font-semibold text-[#DCEBC8] text-sm uppercase tracking-[0.25em]">
                  Phase {index + 1}
                </p>
                <h4 className="mb-3 font-semibold text-xl">{phase.title}</h4>
                <p className="font-normal text-white/90 leading-relaxed">
                  {phase.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          {/* Header */}
          <div className="mb-12">
            <h2
              className="mb-3 font-bold text-3xl text-black md:text-4xl"
              style={{
                fontFamily: "Inter",
              }}
            >
              Capital raised the right way doesn't just fund growth — it maximizes what your business is worth the day you exit.
            </h2>
            <p
              className="text-2xl text-[#636466] md:text-lg"
              style={{
                fontFamily: "Inter",
              }}
            >
              We work across seven types of capital, matched to what your
              business and its stage actually call for.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fundingCards.map((card) => (
              <ConsultingCard
                key={card.id}
                {...card}
                isExpanded={expandedCard === card.id}
                onToggle={() => toggleCard(card.id)}
                visible={false}
              />
            ))}
          </div>
        </div>
      </section>
      {/* <div className="h-11 pt-11">{breadcrumbs}</div> */}

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
            Funding opportunities available with African{" "}
            <span className="text-[#FFC72C] font-normal">Aspirations</span>
          </h2>

          <div className="space-y-8">
            {businessFundingServices.map((item) => (
              <div
                key={item?.id}
                id={item?.id}
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

      <BottomHero
        backgroundImage="/new_images/156.png"
        title="We have an extensive network of numerous funding partners"
        buttonTitle="Leave us a message"
        titleContainerClass="max-w-[627px]"
        link={"https://forms.fillout.com/t/oEtePaNuxSus"}
      />

      <Footer />
    </div>
  );
}
