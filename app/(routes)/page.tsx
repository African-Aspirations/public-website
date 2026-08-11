"use client";

import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomHero from "@/components/BottomHero";
import Billboard from "@/components/billboard";
import ClientNavbar from "@/components/client-navbar";
import FloatingArrow from "@/components/floating-arrow";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const highlightPercentages = (text: string) => {
    return text.replace(/(\d+%)/g, '<span class="text-[#739F46]">$1</span>');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const router = useRouter();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <ClientNavbar />

      {/* Hero Section */}
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-start gap-10 px-4 pt-[100px] md:flex-nowrap md:px-8 md:pt-[200px]">
        {/* Left: text */}
        <div className="flex w-full flex-col gap-8 md:w-1/2">
          <h1
            className="font-bold text-3xl text-black leading-tight md:text-[70px]"
            style={{ fontFamily: "Inter" }}
          >
            <span className="block">Build value today.</span>
            <span className="block">
              <span className="text-[#739F46]">Exit stronger tomorrow.</span>
            </span>
          </h1>

          <span
            className="font-normal text-black text-xl md:text-2xl"
            style={{ fontFamily: "Inter" }}
          >
            African Aspirations helps founders, owners, and investors build
            businesses that are resilient, fundable, and ready to create
            maximum value when the time comes to grow, transition, or exit.
          </span>

          <Button
            onClick={() => router.push("/about")}
            className="w-fit rounded-full border-2 border-[#015A1A] bg-white px-8 py-2 font-bold text-base text-black hover:bg-white"
            style={{ fontFamily: "Inter" }}
          >
            Discover our approach
          </Button>
        </div>

        {/* Right: billboard */}
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Billboard />
        </motion.div>
      </div>
      <FloatingArrow />

      <div className="bg-white py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp as any}
          className="mx-auto mb-10 max-w-[90rem] px-4 md:px-8"
        >
          <h2
            className="mb-3 font-bold text-3xl text-black md:text-4xl"
            style={{
              fontFamily: "Inter",
            }}
          >
            We help owners at every stage of the journey
          </h2>
          <p
            className="text-2xl text-[#636466] md:text-lg"
            style={{
              fontFamily: "Inter",
            }}
          >
            From growth to value creation to exit
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-10 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-3 xl:grid-cols-4"
        >
          {[
            {
              id: 1,
              img: "/new_images/15.jpg",
              title: "Business Consulting",
              desc: "Strategic advice to strengthen governance, scale with discipline, and build a business that can outlast its founder.",
              link: "/business-consulting",
            },
            {
              id: 2,
              img: "/new_images/8.jpg",
              title: "Business Funding",
              desc: "Access to capital that supports expansion, resilience, and long-term value creation.",
              link: "/business-funding",
            },
            {
              id: 3,
              img: "/new_images/16.jpg",
              title: "Business Valuation",
              desc: "Independent valuation support that clarifies enterprise value for fundraising, negotiations, and strategic planning.",
              link: "/business-valuation",
            },
            {
              id: 4,
              img: "/new_images/13.jpg",
              title: "Business Brokerage",
              desc: "A trusted path to buyer matching, negotiation, and a smooth exit when the time is right.",
              link: "/business-brokerage",
            },
          ]?.map((item) => {
            return (
              <motion.div
                key={item?.id}
                variants={itemVariants as any}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                className="h-full w-full"
              >
                <Link href={item.link} className="flex h-full flex-col">
                  <div className="flex h-full flex-col overflow-hidden rounded-[20px]">
                    <div className="group relative h-48 w-full overflow-hidden">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col bg-[#026B20] p-6 transition-all duration-300 hover:scale-[1.01]">
                      <h3
                        className="mb-3 font-bold text-white text-xl md:text-2xl"
                        style={{ fontFamily: "Inter" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="mb-6 flex-1 font-normal text-[#F7FAFE] text-sm md:text-base"
                        style={{ fontFamily: "Inter" }}
                      >
                        {item.desc}
                      </p>
                      <span
                        style={{ fontFamily: "Inter" }}
                        className="w-fit rounded-full border-2 border-white bg-transparent px-8 py-2 font-medium text-sm text-white transition hover:bg-white hover:text-[#026B20]"
                      >
                        Learn more
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[90rem] px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="flex flex-col items-center gap-10 rounded-[32px] bg-white p-6 md:gap-16 md:p-12 lg:flex-row"
          >
            <div className="relative h-64 w-full overflow-hidden rounded-3xl bg-[#F7FBEF] lg:h-[380px] lg:w-1/2">
              <Image
                src={"/new_images/The-Republic-Cover-Landscape-Image-Card-5 1.svg"}
                alt="AA globe"
                fill
                className="mix-blend-multiply object-contain -scale-x-100"
              />
            </div>

            <div className="w-full lg:w-1/2">
              <p className="mb-3 font-semibold text-[#739F46] text-sm uppercase tracking-[0.25em]">
                Why timing matters
              </p>
              <h3 className="mb-4 font-bold text-black text-2xl md:text-3xl">
                The value of planning early
              </h3>
              <p className="mb-6 text-[#444] text-base leading-relaxed md:text-lg">
                Most founders wait until they're ready to exit before
                thinking about value — by then, it's often too late to
                change the outcome.
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: 1,
                    text: "Most businesses are built around the founder. That can limit growth, reduce resilience, and weaken value at exit.",
                  },
                  {
                    id: 2,
                    text: "Businesses with clear strategy, strong governance, and credible financials attract better capital and stronger buyers.",
                  },
                  {
                    id: 3,
                    text: "When value is understood early and prepared intentionally, owners are better positioned to exit on their terms and at a premium.",
                  },
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#739F46]" />
                    <span
                      className="text-[#333] text-base leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: highlightPercentages(item.text),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-[#F7FBEF] py-20"
      >
        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-10 px-4 md:flex-row md:justify-between md:px-8">
          <div>
            <h3 className="max-w-3xl font-bold text-black text-3xl leading-snug md:text-4xl">
              We help you build a business that can grow, endure, and be
              sold on your terms — whether you’re strengthening governance,
              raising capital, or planning an exit.
            </h3>
            <Button
              onClick={() => router.push("https://forms.fillout.com/t/oEtePaNuxSus")}
              className="mt-8 w-fit rounded-full border-2 border-[#015A1A] bg-[#015A1A] px-8 py-2 font-bold text-base text-white hover:bg-[#014214]"
              style={{ fontFamily: "Inter" }}
            >
              Book a consultation
            </Button>
          </div>
          <motion.div
            variants={scaleUp as any}
            className="w-full max-w-[768px] shrink-0 md:w-auto"
          >
            <Image
              src={"/new_images/The-Republic-Cover-Landscape-Image-Card-5 1.svg"}
              width={235}
              height={235}
              alt="AA globe"
              className="mix-blend-multiply h-auto w-full max-w-[900px] -scale-x-100"
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative h-auto w-full overflow-hidden bg-[#004714] md:h-[440px]"
      >
        {/* Trapezoid logo panel — desktop, fills the entire left region */}
        <motion.div
          variants={slideInLeft as any}
          className="absolute inset-y-0 left-0 hidden w-[54%] items-center justify-center bg-white p-16 [clip-path:polygon(0_0,100%_0,82%_100%,0_100%)] md:flex"
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            src="/new_images/TBALogo_origin.webp"
            alt="Transworld Logo"
            className="w-[340px] object-contain lg:w-[400px]"
          />
        </motion.div>

        <div className="relative mx-auto flex h-full max-w-[90rem] flex-col items-stretch gap-6 px-4 py-8 md:flex-row md:items-center md:gap-10 md:px-6 md:py-0">
          {/* Logo panel — mobile only */}
          <motion.div
            variants={slideInLeft as any}
            className="flex items-center justify-center rounded-2xl bg-white p-10 md:hidden"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              src="/new_images/TBALogo_origin.webp"
              alt="Transworld Logo"
              className="w-[280px] object-contain"
            />
          </motion.div>

          {/* Right Section */}
          <motion.div
            variants={slideInRight as any}
            className="flex flex-col justify-center text-white md:ml-[56%] md:w-1/2"
          >
            <h2
              className="font-bold text-xl leading-snug md:text-xl"
              style={{
                fontFamily: "Inter",
              }}
            >
              Our partnership with the world’s largest business brokerage{" "}
              Transworld Business Advisors (TBA)
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 font-light text-[#F5F5F5A6] text-base leading-relaxed md:text-[20px]"
            >
              Our partnership with Transworld Business Advisors gives African owners access to a global marketplace of serious buyers, investors, and strategic opportunities.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <BottomHero
        backgroundImage="/new_images/16.jpg"
        title="Ready to build, grow, and exit well?"
        buttonTitle="Speak with our team"
        link={"https://forms.fillout.com/t/oEtePaNuxSus"}
      />
      <Footer />
    </main>
  );
}
