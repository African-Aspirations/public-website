"use client";

import * as motion from "motion/react-client";
import Link from "next/link";
import BottomHero from "@/components/BottomHero";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/HeroSection";

const pillars = [
  {
    title: "Prepare the business to stand on its own",
    description:
      "A business that depends entirely on its founder is hard to hand over. We help you build the systems and leadership bench that let it run without you.",
  },
  {
    title: "Prepare your successor, not just the business",
    description:
      "Whether it's a son, a daughter, or a longtime deputy, we help you identify, prepare, and structure the handover to whoever is next in line.",
  },
  {
    title: "Protect the value you're passing on",
    description:
      "A clear valuation baseline and defined governance mean everyone involved, family included, knows exactly what's being transferred, and at what value.",
  },
];

const steps = [
  {
    title: "Assess the business",
    copy:
      "We review the business model, leadership structure, financial performance, and succession readiness to identify gaps before they become problems.",
  },
  {
    title: "Prepare the successor",
    copy:
      "We help identify and prepare the person taking over, whether family or a trusted member of your team, so they're ready to lead from day one.",
  },
  {
    title: "Structure the handover",
    copy:
      "We support valuation, governance, and ownership transfer so the transition is orderly and protects the value you've built.",
  },
];

export default function ExitAndSuccessionPage() {
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
          title="Exit & Succession"
          subtitle="For owners handing the business to family or a trusted successor, not selling it to a stranger."
          img="/new_images/image 16.png"
        />
      </motion.div>

      <section className="mx-auto max-w-[90rem] px-4 py-16 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="mb-6 font-bold text-black text-3xl leading-tight md:text-5xl">
              Some owners want to keep the business in the family. Others want to hand it to the people who've earned it.
            </h2>
            <p className="max-w-2xl font-normal text-[#444] text-lg leading-relaxed">
              If your plan is to hand the business to family or a trusted successor rather than sell it to a third party, that transition deserves the same rigor as a sale. Preparing early, not improvising at the last minute, protects the seller and the business well after the seller has stepped back.{" "}
              Considering a sale to a buyer instead?{" "}
              <Link
                href="/business-brokerage"
                className="font-semibold text-[#015A1A] underline underline-offset-2"
              >
                See Business Brokerage
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl bg-[#F8FCEF] p-8">
            <h3 className="mb-3 font-semibold text-[#015A1A] text-xl">
              Our take
            </h3>
            <p className="font-normal text-[#444] text-lg leading-relaxed">
              We believe the owner’s objective should be to maximize return on investment at exit, even when that exit isn't a sale. For a handover to family or a trusted successor, that means a business that can survive beyond the founder, a successor who's actually ready to lead it, and clarity on the value being transferred.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F5] py-16">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <h3 className="mb-10 font-bold text-black text-3xl md:text-4xl">
            What we help owners do
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl bg-white p-8">
                <h4 className="mb-3 font-semibold text-[#015A1A] text-xl">
                  {pillar.title}
                </h4>
                <p className="font-normal text-[#666] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#015A1A] py-16 text-white md:py-20">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <h3 className="mb-10 font-bold text-3xl md:text-4xl">
            A practical path to a better transition
          </h3>
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title}>
                <p className="mb-3 font-bold text-2xl text-[#A9D48C]">
                  {String(index + 1).padStart(2, "0")}
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

      <section className="bg-[#F8FCEF] py-16">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <h3 className="mb-4 max-w-3xl font-bold text-black text-3xl md:text-4xl">
            If you are preparing for the next chapter, we can help you start now.
          </h3>
          <p className="mb-6 max-w-2xl font-normal text-[#555] text-lg leading-relaxed">
            The right preparation creates leverage. It improves value, protects continuity, and ensures that the transition is as intentional as the growth that came before it.
          </p>
          <Link
            href="https://forms.fillout.com/t/oEtePaNuxSus"
            className="inline-flex rounded-full bg-[#015A1A] px-6 py-3 font-semibold text-white transition hover:bg-[#014214]"
          >
            Book a consultation
          </Link>
        </div>
      </section>

      <BottomHero
        backgroundImage="/new_images/16.jpg"
        title="A sharper transition begins with better preparation"
        buttonTitle="Speak with our team"
        link="https://forms.fillout.com/t/oEtePaNuxSus"
      />
      <Footer />
    </div>
  );
}
