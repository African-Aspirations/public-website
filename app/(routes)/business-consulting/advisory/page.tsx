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

const advisoryPractices: Omit<ConsultingCardProps, "isExpanded" | "onToggle">[] =
  [
    {
      id: 0,
      title: "Insurance",
      href: "/insurance",
      image: "/new_images/1.jpg",
      imageAlt: "Insurance advisory",
      description:
        "Deep expertise across all insurance lines — Life, General, Health, Brokerage, and Reinsurance — with an integrated approach to value creation for insurance sector clients.",
      expandedDescription:
        "With deep expertise in all insurance lines, we offer an integrated approach to value creation for our insurance sector clients.",
      details: [],
    },
    {
      id: 1,
      title: "Actuarial & Financial Modeling",
      href: "/acturial-and-financial-modeling",
      image: "/new_images/3.jpg",
      imageAlt: "Actuarial and financial modeling",
      description:
        "Global actuarial expertise applied to local realities — Product Development, Pricing, Experience Studies, Assumption Development, Valuation, and Financial Reporting.",
      expandedDescription:
        "Our actuarial team leverages global expertise to create customized local solutions for our clients.",
      details: [],
    },
    {
      id: 2,
      title: "Investment & Asset Liability Management",
      href: "/investment-and-asset-liability-management",
      image: "/new_images/4.jpg",
      imageAlt: "Investment and asset liability management",
      description:
        "Liability-Driven Investment strategies built on a clear understanding of liability emergence and characteristics, ensuring assets match what they support.",
      expandedDescription:
        "By understanding the emergence and characteristics of liabilities, we advise clients on Liability-Driven Investment strategies.",
      details: [],
    },
    {
      id: 3,
      title: "Risk Management",
      href: "/risk-management",
      image: "/new_images/5.jpg",
      imageAlt: "Risk management",
      description:
        "Defensive techniques to identify, assess, mitigate, monitor, and report on business risk — paired with offensive techniques that embed risk management into growth.",
      expandedDescription:
        "Our Risk Management approach empowers clients to embrace risk rather than retreat from it — risk and opportunity go hand-in-hand.",
      details: [],
    },
    {
      id: 4,
      title: "Compliance",
      href: "/compliance",
      image: "/new_images/6.jpg",
      imageAlt: "Compliance",
      description:
        "Effective compliance frameworks aligned with regulatory requirements and international best practices, strengthening governance and business integrity.",
      expandedDescription:
        "We combine global regulatory insight with practical implementation support, enabling clients to meet complex compliance obligations while maintaining agility.",
      details: [],
    },
  ];

export default function AdvisoryPage() {
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-24 md:pt-20"
      >
        <HeroSection
          title="Advisory"
          subtitle="Deep, specialized expertise for the complex challenges generalized consulting doesn't reach."
          img="/new_images/image 16.png"
        />
      </motion.div>

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
              Advisory practices
            </h2>
            <p
              className="text-2xl text-[#636466] md:text-lg"
              style={{
                fontFamily: "Inter",
              }}
            >
              Our advisory practices support business owners and
              institutions as they build stronger businesses, improve
              resilience, and prepare for long-term value creation and
              successful transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advisoryPractices.map((card) => (
              <ConsultingCard
                key={card.id}
                {...card}
                isExpanded={expandedCard === card.id}
                onToggle={() => toggleCard(card.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <BottomHero
        backgroundImage="/new_images/156.png"
        title="We are experts at Institutionalization"
        buttonTitle="Leave us a message"
        link={"https://forms.fillout.com/t/oEtePaNuxSus"}
      />

      <Footer />
    </div>
  );
}
