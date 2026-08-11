"use client";

import * as motion from "motion/react-client";
import Link from "next/link";
import BottomHero from "@/components/BottomHero";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/HeroSection";

const risks = [
  {
    title: "Leads to overpricing",
    description:
      "An inflated number looks good on paper, but it scares off serious buyers and stalls deals before they start.",
  },
  {
    title: "Causes underpricing",
    description:
      "Undervaluing the business hands away money you've already earned, often without anyone noticing until it's too late.",
  },
  {
    title: "Can fail scrutiny",
    description:
      "A valuation that can't survive due diligence collapses deals at the worst possible moment, after everyone has already invested time and trust.",
  },
];

const steps = [
  {
    title: "Financial analysis",
    copy: "We review your financials, add-backs, and performance trends to establish a clean, defensible baseline.",
  },
  {
    title: "Market benchmarking",
    copy: "We compare your business against real market transactions and sector multiples, not guesswork.",
  },
  {
    title: "An industry-grade report",
    copy: "You walk away with a defensible, decision-grade valuation ready for a sale, a raise, or a regulator.",
  },
];

export default function BusinessValuationPage() {
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
          title="Business Valuation"
          subtitle="A number you can defend, not just a number."
          img="/new_images/image 16.png"
        />
      </motion.div>

      <section className="mx-auto max-w-[90rem] px-4 py-16 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-4 font-semibold text-[#739F46] text-sm uppercase tracking-[0.3em]">
              What is your business worth?
            </p>
            <h2 className="mb-6 font-bold text-black text-3xl leading-tight md:text-5xl">
              A valuation isn't just a number. It's a position you can defend.
            </h2>
            <p className="max-w-2xl font-normal text-[#444] text-lg leading-relaxed">
              Whether you're preparing for a sale, raising capital, meeting a
              regulatory requirement, or simply want to know where you stand,
              we deliver valuation insight with speed, precision, and
              credibility.
            </p>
          </div>
          <div className="rounded-[28px] border border-[#DCEBC8] bg-[#F8FCEF] p-8">
            <p className="mb-3 font-semibold text-[#015A1A] text-xl">
              Our positioning
            </p>
            <p className="font-normal text-[#444] text-lg leading-relaxed">
              Understanding the true worth of your business is essential for
              any transaction or partnership. Our valuation experts combine
              financial analysis, market benchmarking, and sector insights to
              deliver accurate, defensible valuations that position your
              business competitively for sale or investment.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <div className="mb-10">
            <h3 className="font-bold text-black text-3xl md:text-4xl">
              Weak valuations cost real money
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {risks.map((risk) => (
              <div
                key={risk.title}
                className="rounded-[24px] bg-white p-8 shadow-sm"
              >
                <h4 className="mb-3 font-semibold text-[#015A1A] text-xl">
                  {risk.title}
                </h4>
                <p className="font-normal text-[#666] leading-relaxed">
                  {risk.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 py-16 md:px-8">
        <div className="rounded-[32px] bg-[#015A1A] p-8 text-white md:p-12">
          <h3 className="mb-8 font-bold text-3xl md:text-4xl">
            What you can expect when you value your business with us
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[24px] border border-white/20 bg-white/10 p-6"
              >
                <p className="mb-3 font-semibold text-[#DCEBC8] text-sm uppercase tracking-[0.25em]">
                  Step {index + 1}
                </p>
                <h4 className="mb-3 font-semibold text-xl">{step.title}</h4>
                <p className="font-normal text-white/90 leading-relaxed">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-4 pb-16 md:px-8">
        <div className="rounded-[28px] border border-[#DCEBC8] bg-[#F8FCEF] p-8 md:p-10">
          <h3 className="mb-4 font-bold text-black text-3xl md:text-4xl">
            Want to know what your business is worth?
          </h3>
          <p className="mb-6 max-w-2xl font-normal text-[#555] text-lg leading-relaxed">
            Whether you're planning a sale, raising capital, or just checking
            in on your life's work, get an honest number to work from.
          </p>
          <Link
            href="https://forms.fillout.com/t/oEtePaNuxSus"
            className="inline-flex rounded-full bg-[#015A1A] px-6 py-3 font-semibold text-white transition hover:bg-[#014214]"
          >
            Get Your Valuation
          </Link>
        </div>
      </section>

      <BottomHero
        backgroundImage="/new_images/16.jpg"
        title="You've built a great business. Find out what it's really worth."
        buttonTitle="Leave us a message"
        link="https://forms.fillout.com/t/oEtePaNuxSus"
      />
      <Footer />
    </div>
  );
}
