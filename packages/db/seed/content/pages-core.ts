/**
 * Core pages transcribed from the legacy site:
 *  - ""                   app/(routes)/page.tsx, data/carousel.ts, components/billboard.tsx
 *  - "about"              app/(routes)/about/page.tsx
 *  - "business-brokerage" app/(routes)/business-brokerage/page.tsx, components/PuzzleHeroSection.tsx
 *  - "listings"           app/(routes)/listings/page.tsx (intro copy only; grid is a template)
 *  - "media-and-insights" app/(routes)/media-and-insights/page.tsx
 */
import { asset, ref, type SeedPage } from "../types";

// Decorative background used behind the bottom CTA band on several pages.
const ctaBackground7 = asset("new_images/7.jpg", "");

export const corePages: SeedPage[] = [
  // ---------------------------------------------------------------- Home
  {
    slug: "",
    title: "Home",
    template: "home",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Build value today. Exit stronger tomorrow.",
          body: "African Aspirations helps founders, owners, and investors build businesses that are resilient, fundable, and ready to create maximum value when the time comes to grow, transition, or exit.",
          imageIds: [
            asset("new_images/1.jpg", "Businesswoman checking her phone among city office towers"),
            asset("new_images/8.jpg", "Smiling greenhouse worker holding a crate of fresh lettuce"),
            asset("new_images/11.jpg", "Smiling man on a phone call outdoors under green trees"),
            asset("new_images/16.jpg", "Two colleagues reviewing work together at a laptop"),
            asset("new_images/3.jpg", "Group of colleagues laughing together around a table"),
          ],
          cta: { label: "Discover our approach", href: "/about" },
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "We help owners at every stage of the journey",
          intro: "From growth to value creation to exit",
          columns: 4,
          cards: [
            {
              title: "Business Consulting",
              body: "Strategic advice to strengthen governance, scale with discipline, and build a business that can outlast its founder.",
              imageId: asset(
                "new_images/15.jpg",
                "Man in a cap and glasses trimming a hedge outdoors",
              ),
              href: "/business-consulting",
            },
            {
              title: "Business Funding",
              body: "Access to capital that supports expansion, resilience, and long-term value creation.",
              imageId: asset(
                "new_images/8.jpg",
                "Smiling greenhouse worker holding a crate of fresh lettuce",
              ),
              href: "/business-funding",
            },
            {
              title: "Business Valuation",
              body: "Independent valuation support that clarifies enterprise value for fundraising, negotiations, and strategic planning.",
              imageId: asset(
                "new_images/16.jpg",
                "Two colleagues reviewing work together at a laptop",
              ),
              href: "/business-valuation",
            },
            {
              title: "Business Brokerage",
              body: "A trusted path to buyer matching, negotiation, and a smooth exit when the time is right.",
              imageId: asset(
                "new_images/13.jpg",
                "Two businessmen in suits talking at an outdoor café table",
              ),
              href: "/business-brokerage",
            },
          ],
        },
      },
      {
        type: "rich_text",
        data: {
          eyebrow: "Why timing matters",
          heading: "The value of planning early",
          body: [
            "Most founders wait until they're ready to exit before thinking about value — by then, it's often too late to change the outcome.",
            "",
            "- Most businesses are built around the founder. That can limit growth, reduce resilience, and weaken value at exit.",
            "- Businesses with clear strategy, strong governance, and credible financials attract better capital and stronger buyers.",
            "- When value is understood early and prepared intentionally, owners are better positioned to exit on their terms and at a premium.",
          ].join("\n"),
          imageId: asset(
            "new_images/The-Republic-Cover-Landscape-Image-Card-5 1.svg",
            "Line sketch of a city skyline with an aeroplane overhead",
          ),
          imageSide: "left",
        },
      },
      {
        type: "cta",
        data: {
          heading:
            "We help you build a business that can grow, endure, and be sold on your terms — whether you’re strengthening governance, raising capital, or planning an exit.",
          cta: { label: "Book a consultation", href: "/contact" },
          imageId: asset(
            "new_images/The-Republic-Cover-Landscape-Image-Card-5 1.svg",
            "Line sketch of a city skyline with an aeroplane overhead",
          ),
          tone: "band",
        },
      },
      {
        type: "rich_text",
        data: {
          heading:
            "Our partnership with the world’s largest business brokerage Transworld Business Advisors (TBA)",
          body: "Our partnership with Transworld Business Advisors gives African owners access to a global marketplace of serious buyers, investors, and strategic opportunities.",
          imageId: asset("new_images/TBALogo_origin.webp", "Transworld Business Advisors logo"),
          imageSide: "left",
        },
      },
      {
        type: "cta",
        data: {
          heading: "Ready to build, grow, and exit well?",
          cta: { label: "Speak with our team", href: "/contact" },
          imageId: asset("new_images/16.jpg", ""),
          tone: "dark",
        },
      },
    ],
    review: [
      'Legacy carousel images all had the generic alt "African Aspirations"; alt text was rewritten from the photos.',
      'Legacy alt "AA globe" for The-Republic-Cover-Landscape-Image-Card-5 1.svg is wrong (it is a city-skyline sketch); the same illustration was used twice (timing section and the green CTA band). Consider dropping one.',
      'TBA band heading reads "…largest business brokerage Transworld Business Advisors (TBA)" — missing punctuation (e.g. a colon or dash) between "brokerage" and "Transworld". Kept verbatim. Transcribed as rich_text to keep its copy; a `partner` section (ref tba) could replace it.',
      '"Book a consultation" and "Speak with our team" pointed to the Fillout form; now /contact.',
      'Service cards each had a "Learn more" button label; card_grid has no per-card link label.',
      "Image 16.jpg is used in the hero carousel, the Valuation card and the bottom CTA background.",
    ],
  },

  // ---------------------------------------------------------------- About
  {
    slug: "about",
    title: "About",
    sections: [
      {
        type: "hero",
        data: {
          heading:
            "African Aspirations exists to help business owners turn their life’s work into lasting value.",
          imageIds: [
            asset("new_images/2148913227 2.png", "African business team collaborating"),
            asset(
              "new_images/precision-farming 1.png",
              "African entrepreneur in agricultural setting",
            ),
          ],
        },
      },
      {
        type: "rich_text",
        data: {
          body: [
            "Every business owner faces a journey: build, grow, strengthen, and eventually decide what happens next. We believe the most important objective is to maximize return on investment when the time comes to exit.",
            "Through our integrated approach to consulting, funding, valuation, and brokerage, we help founders create businesses that are institution-ready, fundable, valuable, and ready for a successful transition.",
            "Rooted in Ghana and connected to global opportunity, African Aspirations helps entrepreneurs build enterprises that can thrive in the present and endure beyond the founder.",
          ].join("\n\n"),
        },
      },
      {
        type: "team",
        data: {
          heading: "Our Leadership",
          intro:
            "Our team combines world-class expertise with local insight to deliver professional excellence across every engagement.",
        },
      },
      { type: "partner", data: { partnerId: ref("partner", "tba") } },
      {
        type: "cta",
        data: {
          heading: "What does your next chapter look like?",
          cta: { label: "Book a consultation", href: "/contact" },
          imageId: ctaBackground7,
          tone: "dark",
        },
      },
    ],
    review: [
      "Legacy page had no <h1>: the hero heading is the legacy intro <h2>. The page opened with a banner of the AA logo (new_images/image 14.svg), which was dropped (it is the site logo).",
      "The two intro photos were an overlapping collage beside the text; they are now the hero images.",
      'Bottom CTA "Book a consultation" had no link in the legacy page (BottomCTASection rendered with link undefined); set to /contact.',
      'Leader bios: see team member notes in site.ts — Nigel Nunoo\'s bio repeats his summary sentence and says both "over 20" and "over 25 years"; his credentials (CFA, CFE) differ from the bio (CFA, FSA); C.C. Bruce\'s credentials (PhD, MBA, CPA, FCCA) do not match his bio (ACII, FIIG, DipFM, MA).',
      "Legacy anchors #our-team and #our-global-partner are linked from the header menu.",
    ],
  },

  // ---------------------------------------------------------------- Business Brokerage
  {
    slug: "business-brokerage",
    title: "Business Brokerage",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Business Brokerage",
          body: "Have you ever considered selling your business?",
          imageIds: [asset("new_images/Union.png", "Two business people shaking hands")],
          cta: { label: "Reach out to us", href: "/contact" },
        },
      },
      {
        type: "rich_text",
        data: {
          eyebrow: "Our Simple, Confidential Brokerage Process",
          heading: "Every business owner eventually faces a defining question: what comes next?",
          body: "We help owners prepare for that moment with clarity, positioning, and access to serious buyers so that the exit is not rushed, reactive, or undervalued.",
          imageId: asset(
            "new_images/bbn1.png",
            "Diagram of the brokerage process: the business owner (seller) works with African Aspirations (broker), who presents the business to several potential buyers until one buyer completes the purchase and the business is sold",
          ),
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "Built for every side of the deal",
          intro:
            "Whether you're selling, buying, or investing across borders, we bring the same rigor and the same network to every transaction.",
          columns: 3,
          cards: [
            {
              title: "For African Business Sellers",
              body: "An African marketplace for business owners to sell their business, or a stake in it, to serious investors. Through our relationship with Transworld Business Advisors — the world's largest business brokerage network — we connect African owners with buyers across the globe.",
              imageId: asset(
                "new_images/image 25.png",
                "Smiling business owner in an apron standing in his café",
              ),
              items: [
                { title: "Reach vetted, capital-ready buyers in global markets" },
                { title: "Secure fair valuations & better exits" },
                { title: "Receive full support through negotiation to closing" },
                { title: "Maximize liquidity from your life’s work" },
                { title: "Benefit from tax, legal, and compliance guidance" },
              ],
            },
            {
              title: "For Buyers of African Businesses",
              body: "We provide access to vetted, cash-flowing African businesses across multiple sectors. Our buyer clients benefit from proprietary listings, verified seller information, and expert guidance through due diligence and negotiations.",
              imageId: asset(
                "new_images/image 25.png",
                "Smiling business owner in an apron standing in his café",
              ),
              items: [
                { title: "Access curated, high-potential ventures" },
                { title: "Get support for due diligence & financing" },
                { title: "Expand confidently with trusted local expertise" },
                { title: "Acquire stable, cash-flowing businesses" },
                { title: "Benefit from end-to-end acquisition support" },
              ],
            },
            {
              title: "Africans Looking to Invest Globally",
              body: "We help African investors diversify their portfolios internationally through franchise opportunities, business acquisitions, and cross-border partnerships, with exposure to stable, high-growth markets.",
              imageId: asset(
                "new_images/image 25.png",
                "Smiling business owner in an apron standing in his café",
              ),
              items: [
                { title: "Invest in vetted international businesses" },
                { title: "Enter global markets through secure pathways" },
                { title: "Enjoy education, healthcare & lifestyle benefits" },
                { title: "Gain residency or citizenship by investment" },
                { title: "Earn in strong, stable foreign currencies" },
              ],
            },
          ],
        },
      },
      {
        type: "rich_text",
        data: {
          heading: "Backed by the world's largest business brokerage network",
          body: "We operate Transworld Business Advisors Ghana — the Master Franchise for Africa.",
          imageId: asset("new_images/TBALogo_origin.webp", "Transworld Business Advisors logo"),
        },
      },
      {
        type: "stats",
        data: {
          stats: [
            { value: "250", label: "Global Offices" },
            { value: "600,000+", label: "Active Investor Network" },
            { value: "1,000+", label: "Global Active Agents" },
          ],
        },
      },
      {
        type: "cta",
        data: {
          heading: "Exit on your own terms",
          cta: { label: "Contact Us", href: "/contact" },
          imageId: ctaBackground7,
          tone: "dark",
        },
      },
    ],
    review: [
      "All three audience cards use the same photo (new_images/image 25.png) — placeholder; needs distinct images.",
      'Each audience card had an eyebrow ("For Sellers", "For Buyers", "For Global Investors") that card_grid cannot hold; dropped as it repeats the card title.',
      "TBA block (heading + logo + stats) is transcribed as rich_text + stats to keep its page-specific copy; the stats duplicate the TBA partner record — a `partner` section (ref tba) could replace both.",
      '"Reach out to us" (hero) and "Contact Us" (bottom CTA) pointed to the Fillout form; now /contact.',
      "Skipped unused data `_businessBrokerageServices` (African Business Sellers, Buyers of African Businesses, Africans Looking to Invest Globally, Business Valuation, Pitch Books — longer descriptions with icons new_images/image 9–13.svg). It is the only place Pitch Books are described, which the footer links to.",
      'Skipped commented-out code: the "Brokerage opportunities available with African Aspirations" services grid, a decorative line (new_images/Meliuk-liuk.svg) and a BottomHero "We are experts at Institutionalization" / "Leave us a message" (new_images/156.png).',
    ],
  },

  // ---------------------------------------------------------------- Listings
  {
    slug: "listings",
    title: "Listings",
    template: "listings", // listing grid renders between the hero and the CTA
    sections: [
      {
        type: "hero",
        data: {
          heading: "Discover verified deals across Ghana.",
          body: "Explore exceptional businesses, investment opportunities, and growth-ready ventures with the support of trusted advisors.",
          imageIds: [],
        },
      },
      {
        type: "cta",
        data: {
          heading: "Looking for a specific opportunity?",
          cta: { label: "Speak with an advisor", href: "/contact" },
          imageId: ctaBackground7,
          tone: "dark",
        },
      },
    ],
    review: [
      "Only the intro and bottom CTA are sections; the search/filter bar and listing grid are rendered by the listings template, which must sit between the hero and the CTA.",
      'Template UI copy not transcribed as sections: search placeholder "Search by business, industry, or location", sort options ("Newest arrivals", "Price: Low to High", "Price: High to Low"), "Price on request", "Verified" badge, loading text "Finding verified opportunities…", empty state "No matching opportunities" / "Try adjusting your search or filters. Our advisory team can also help you identify an off-market opportunity." / "Clear all filters".',
      'Listings without an image fell back to new_images/Union.png; the region defaulted to "Ghana".',
      '"Speak with an advisor" pointed to the Fillout form; now /contact.',
    ],
  },

  // ---------------------------------------------------------------- Media & Insights
  {
    slug: "media-and-insights",
    title: "Media & Insights",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Join our newsletter",
          imageIds: [
            asset(
              "new_images/image 16.png",
              "Man in glasses working at a desk in front of a chart of rising money growth",
            ),
          ],
          cta: { label: "See latest deals", href: "/listings" },
        },
      },
      { type: "newsletter_form", data: {} },
      {
        type: "cta",
        data: {
          heading: "Curious about your industry?",
          cta: { label: "Leave us a message", href: "/contact" },
          imageId: asset("new_images/156.png", ""),
          tone: "dark",
        },
      },
    ],
    review: [
      'Legacy page was a placeholder: a "Join our newsletter" hero with no form and no articles/insights. The newsletter_form section is new (no legacy copy) — needs a heading/intro if wanted.',
      'Hero button "See latest deals" links to /listings, which is odd under a newsletter heading.',
      '"Leave us a message" pointed to the Fillout form; now /contact.',
      'The header menu labels this page "Insights".',
    ],
  },
];
