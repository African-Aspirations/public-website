"use client";

import * as motion from "motion/react-client";
import BottomHero from "@/components/BottomHero";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/HeroSection";

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <ClientNavbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-24 md:pt-20"
      >

        <HeroSection
          title="Join our newsletter"
          img="/new_images/image 16.png"
          buttonTitle="See latest deals"
          buttonHref="/listings"
        />
      </motion.div>

      <BottomHero
        backgroundImage="/new_images/156.png"
        backgroundPosition="center 20%"
        title="Curious about your industry?"
        buttonTitle="Leave us a message"
        link={"https://forms.fillout.com/t/oEtePaNuxSus"}
      />

      <Footer />
    </div>
  );
};

export default AboutUs;
