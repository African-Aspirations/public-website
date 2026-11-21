import { asset, type SeedPage } from "../types";

/**
 * Consulting cluster, transcribed from the legacy Next.js site:
 *  - app/(routes)/business-consulting/page.tsx
 *  - app/(routes)/business-consulting/advisory/page.tsx
 *  - app/(routes)/exit-and-succession/page.tsx
 *  - app/(routes)/business-valuation/page.tsx
 *  - app/(routes)/business-funding/page.tsx
 * Shared: components/HeroSection.tsx (hero + "Reach out to us" button),
 * components/BottomHero.tsx (closing CTA band), components/consulting-card.tsx.
 */

const heroImage = asset(
  "new_images/image 16.png",
  "Businessman working at a desk in front of a presentation chart showing a money bag and a rising arrow",
);

// HeroSection's default button (legacy pointed to the Fillout form).
const heroCta = { label: "Reach out to us", href: "/contact" };

export const consultingPages: SeedPage[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "business-consulting",
    title: "Business Consulting",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Business Consulting",
          body: "One place for everything your business needs to operate, scale, and outlast its founder.",
          imageIds: [heroImage],
          cta: heroCta,
          variant: "band",
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "We help founders build businesses that can grow without depending on them.",
          intro:
            "Strategic consulting helps owners strengthen governance, systems, and leadership so the business becomes more valuable, resilient, and ready for the future.",
          columns: 3,
          cards: [
            {
              title: "Generalized Consulting",
              body: "Build strong systems and structures with access to trusted partners and expert guidance (institutionalization)",
              imageId: asset(
                "new_images/68adea73590669a19f87111d_biz-img-1.webp.png",
                "Two colleagues celebrating a result while working on a laptop",
              ),
              items: [
                {
                  title: "Management Consulting",
                  body: "Strengthening governance, structure, and systems.",
                },
                {
                  title: "Strategy",
                  body: "Developing clear, forward-looking roadmaps for growth and market positioning.",
                },
                {
                  title: "Revenue Maximization",
                  body: "Identifying new revenue streams, optimizing margins, and driving profitability.",
                },
                {
                  title: "Franchise Consulting",
                  body: "Structuring and scaling businesses through strategic franchise development.",
                },
              ],
            },
            {
              title: "Advisory",
              body: "Get expert advice in finance, risk, compliance, and investment to solve complex challenges.",
              imageId: asset(
                "new_images/14.jpg",
                "Construction professional in a hard hat and safety vest holding plans and a phone",
              ),
              href: "/business-consulting/advisory",
              items: [
                {
                  title: "Financial Advisory",
                  body: "Strategic financial planning and optimization.",
                },
                {
                  title: "Risk Management",
                  body: "Identifying and mitigating business risks effectively.",
                },
                {
                  title: "Compliance Consulting",
                  body: "Ensuring regulatory compliance across all operations.",
                },
                {
                  title: "Investment Strategy",
                  body: "Developing strategic investment approaches for growth.",
                },
              ],
            },
            {
              title: "Exit & Succession",
              body: "Plan a business exit or succession with clarity — whether that means selling to a buyer or handing over to family.",
              imageId: asset("new_images/2.jpg", "Business professionals applauding in a meeting"),
              href: "/exit-and-succession",
              items: [
                {
                  title: "Succession Planning",
                  body: "Preparing the business and a successor for a family or internal handover.",
                },
                {
                  title: "Exit Readiness",
                  body: "Building the systems and governance that hold value beyond the founder.",
                },
                {
                  title: "Valuation Baseline",
                  body: "Establishing a clear valuation so everyone knows what's being transferred.",
                },
              ],
            },
          ],
        },
      },
      {
        type: "rich_text",
        data: {
          heading:
            "African Aspirations’ consulting arm leverages a carefully curated network of expert service providers",
          body: "By connecting businesses to the right experts at the right time, African Aspirations ensures solutions are practical, implementable, and designed to create lasting impact, helping companies institutionalize, grow, and thrive.",
          imageId: asset(
            "new_images/bc1.png",
            "Diagram showing the African Aspirations 'plug' connecting to 100+ vetted world-class solution providers for business institutionalization, including Accounting, HR, Marketing, Legal, and Franchising.",
          ),
          imageSide: "right",
        },
      },
      {
        type: "cta",
        data: {
          heading: "We are experts at Institutionalization",
          cta: { label: "Leave us a message", href: "/contact" },
          imageId: asset("new_images/156.png", ""),
          tone: "dark",
          overlay: "fade",
        },
      },
    ],
    review: [
      "Hero image (new_images/image 16.png) is the same on all five consulting-cluster pages — consider distinct images.",
      "Card sub-item titles had a trailing colon in legacy ('Management Consulting:' etc.); colons removed as presentational.",
      "In legacy, every card on this page had an href, so the card navigated directly and its expanded panel (expandedDescription + detail list) was never reachable. The detail lists are kept as card `items`; the expandedDescription texts were dropped: Generalized Consulting 'Our plug-and-play model connects clients to 100+ service providers with trusted expertise, everything needed to institutionalize your business and operate at global standards.'; Advisory '…Our specialized team brings deep industry knowledge and practical solutions.'; Exit & Succession '…The best transitions are prepared for early, not improvised at the last minute.' Decide whether any should be shown.",
      "'Generalized Consulting' card linked to '/business-consulting#institutionalization' (an anchor on this same page, pointing at the network/diagram section). Href dropped; card has no link now.",
      "Legacy image alts were generic ('Team collaboration', 'Construction professional', 'Business professional'); rewritten from image content. The 14.jpg construction-worker image on the Advisory card may not suit the topic.",
      "Unused data skipped: `_businessConsultingServices` array (8 services with feature lists that don't match the services, e.g. Management Consulting → 'Statistical modeling', 'Pension planning') and the commented-out 'Our consulting services' grid ending in 'and many more...'. Also a commented-out Meliuk-liuk.svg decorative line.",
      "Closing CTA background image (156.png) treated as decorative (alt '').",
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "business-consulting/advisory",
    title: "Advisory",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Advisory",
          body: "Deep, specialized expertise for the complex challenges generalized consulting doesn't reach.",
          imageIds: [heroImage],
          cta: heroCta,
          variant: "band",
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "Advisory practices",
          intro:
            "Our advisory practices support business owners and institutions as they build stronger businesses, improve resilience, and prepare for long-term value creation and successful transitions.",
          columns: 3,
          variant: "feature",
          cards: [
            {
              title: "Insurance",
              body: "Deep expertise across all insurance lines — Life, General, Health, Brokerage, and Reinsurance — with an integrated approach to value creation for insurance sector clients.",
              imageId: asset(
                "new_images/1.jpg",
                "Businesswoman checking her phone among city office towers",
              ),
              href: "/insurance",
            },
            {
              title: "Actuarial & Financial Modeling",
              body: "Global actuarial expertise applied to local realities — Product Development, Pricing, Experience Studies, Assumption Development, Valuation, and Financial Reporting.",
              imageId: asset(
                "new_images/3.jpg",
                "Colleagues laughing together around a meeting table",
              ),
              href: "/actuarial-and-financial-modeling",
            },
            {
              title: "Investment & Asset Liability Management",
              body: "Liability-Driven Investment strategies built on a clear understanding of liability emergence and characteristics, ensuring assets match what they support.",
              imageId: asset("new_images/4.jpg", "Smiling businessman in glasses applauding"),
              href: "/investment-and-asset-liability-management",
            },
            {
              title: "Risk Management",
              body: "Defensive techniques to identify, assess, mitigate, monitor, and report on business risk — paired with offensive techniques that embed risk management into growth.",
              imageId: asset(
                "new_images/5.jpg",
                "Black-and-white photo of a smiling woman looking out of a vehicle",
              ),
              href: "/risk-management",
            },
            {
              title: "Compliance",
              body: "Effective compliance frameworks aligned with regulatory requirements and international best practices, strengthening governance and business integrity.",
              imageId: asset(
                "new_images/6.jpg",
                "Businessman celebrating with arms raised at his office desk",
              ),
              href: "/compliance",
            },
          ],
        },
      },
      {
        type: "cta",
        data: {
          heading: "We are experts at Institutionalization",
          cta: { label: "Leave us a message", href: "/contact" },
          imageId: asset("new_images/156.png", ""),
          tone: "dark",
          overlay: "fade",
        },
      },
    ],
    review: [
      "Legacy Actuarial card linked to '/acturial-and-financial-modeling' (misspelled); now '/actuarial-and-financial-modeling'.",
      "Each card's expandedDescription was never reachable in legacy (cards with href navigate directly) and was dropped, e.g. Insurance 'With deep expertise in all insurance lines, we offer an integrated approach to value creation for our insurance sector clients.' The same texts likely belong on the individual practice pages — check there.",
      "Closing CTA 'We are experts at Institutionalization' duplicates the Business Consulting page and isn't specific to advisory — consider new copy.",
      "Legacy image alts were just the practice names; rewritten from image content. The stock photos (e.g. black-and-white woman in a vehicle for Risk Management) don't illustrate the practices — consider better imagery.",
      "Hero image is the shared 'image 16.png' used on all consulting-cluster pages.",
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "exit-and-succession",
    title: "Exit & Succession",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Exit & Succession",
          body: "For owners handing the business to family or a trusted successor, not selling it to a stranger.",
          imageIds: [heroImage],
          cta: heroCta,
          variant: "band",
        },
      },
      {
        type: "rich_text",
        data: {
          heading:
            "Some owners want to keep the business in the family. Others want to hand it to the people who've earned it.",
          body: "If your plan is to hand the business to family or a trusted successor rather than sell it to a third party, that transition deserves the same rigor as a sale. Preparing early, not improvising at the last minute, protects the seller and the business well after the seller has stepped back. Considering a sale to a buyer instead? [See Business Brokerage](/business-brokerage).",
        },
      },
      {
        type: "rich_text",
        data: {
          heading: "Our take",
          body: "We believe the owner’s objective should be to maximize return on investment at exit, even when that exit isn't a sale. For a handover to family or a trusted successor, that means a business that can survive beyond the founder, a successor who's actually ready to lead it, and clarity on the value being transferred.",
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "What we help owners do",
          columns: 3,
          cards: [
            {
              title: "Prepare the business to stand on its own",
              body: "A business that depends entirely on its founder is hard to hand over. We help you build the systems and leadership bench that let it run without you.",
            },
            {
              title: "Prepare your successor, not just the business",
              body: "Whether it's a son, a daughter, or a longtime deputy, we help you identify, prepare, and structure the handover to whoever is next in line.",
            },
            {
              title: "Protect the value you're passing on",
              body: "A clear valuation baseline and defined governance mean everyone involved, family included, knows exactly what's being transferred, and at what value.",
            },
          ],
        },
      },
      {
        type: "steps",
        data: {
          heading: "A practical path to a better transition",
          steps: [
            {
              title: "Assess the business",
              body: "We review the business model, leadership structure, financial performance, and succession readiness to identify gaps before they become problems.",
            },
            {
              title: "Prepare the successor",
              body: "We help identify and prepare the person taking over, whether family or a trusted member of your team, so they're ready to lead from day one.",
            },
            {
              title: "Structure the handover",
              body: "We support valuation, governance, and ownership transfer so the transition is orderly and protects the value you've built.",
            },
          ],
        },
      },
      {
        type: "cta",
        data: {
          heading: "If you are preparing for the next chapter, we can help you start now.",
          body: "The right preparation creates leverage. It improves value, protects continuity, and ensures that the transition is as intentional as the growth that came before it.",
          cta: { label: "Book a consultation", href: "/contact" },
        },
      },
      {
        type: "cta",
        data: {
          heading: "A sharper transition begins with better preparation",
          cta: { label: "Speak with our team", href: "/contact" },
          imageId: asset("new_images/16.jpg", ""),
        },
      },
    ],
    review: [
      "Page ends with two consecutive CTA sections ('If you are preparing for the next chapter…' / 'A sharper transition begins with better preparation'), both to the contact page — consider merging.",
      "'Our take' was a side panel next to the intro in legacy; now its own rich_text section.",
      "Hero image is the shared 'image 16.png' used on all consulting-cluster pages. Closing CTA background (16.jpg) treated as decorative (alt '').",
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "business-valuation",
    title: "Business Valuation",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Business Valuation",
          body: "A number you can defend, not just a number.",
          imageIds: [heroImage],
          cta: heroCta,
          variant: "band",
        },
      },
      {
        type: "rich_text",
        data: {
          eyebrow: "What is your business worth?",
          heading: "A valuation isn't just a number. It's a position you can defend.",
          body: "Whether you're preparing for a sale, raising capital, meeting a regulatory requirement, or simply want to know where you stand, we deliver valuation insight with speed, precision, and credibility.",
        },
      },
      {
        type: "rich_text",
        data: {
          heading: "Our positioning",
          body: "Understanding the true worth of your business is essential for any transaction or partnership. Our valuation experts combine financial analysis, market benchmarking, and sector insights to deliver accurate, defensible valuations that position your business competitively for sale or investment.",
        },
      },
      {
        type: "card_grid",
        data: {
          heading: "Weak valuations cost real money",
          columns: 3,
          cards: [
            {
              title: "Leads to overpricing",
              body: "An inflated number looks good on paper, but it scares off serious buyers and stalls deals before they start.",
            },
            {
              title: "Causes underpricing",
              body: "Undervaluing the business hands away money you've already earned, often without anyone noticing until it's too late.",
            },
            {
              title: "Can fail scrutiny",
              body: "A valuation that can't survive due diligence collapses deals at the worst possible moment, after everyone has already invested time and trust.",
            },
          ],
        },
      },
      {
        type: "steps",
        data: {
          heading: "What you can expect when you value your business with us",
          steps: [
            {
              title: "Financial analysis",
              body: "We review your financials, add-backs, and performance trends to establish a clean, defensible baseline.",
            },
            {
              title: "Market benchmarking",
              body: "We compare your business against real market transactions and sector multiples, not guesswork.",
            },
            {
              title: "An industry-grade report",
              body: "You walk away with a defensible, decision-grade valuation ready for a sale, a raise, or a regulator.",
            },
          ],
        },
      },
      {
        type: "cta",
        data: {
          heading: "Want to know what your business is worth?",
          body: "Whether you're planning a sale, raising capital, or just checking in on your life's work, get an honest number to work from.",
          cta: { label: "Get Your Valuation", href: "/contact" },
        },
      },
      {
        type: "cta",
        data: {
          heading: "You've built a great business. Find out what it's really worth.",
          cta: { label: "Leave us a message", href: "/contact" },
          imageId: asset("new_images/16.jpg", ""),
        },
      },
    ],
    review: [
      "Page ends with two consecutive CTA sections ('Want to know what your business is worth?' / 'You've built a great business. Find out what it's really worth.') with near-identical messages — consider merging.",
      "'Our positioning' was a side panel next to the intro in legacy; now its own rich_text section. Its copy overlaps the intro paragraph.",
      "Closing CTA background (16.jpg) is the same as on Exit & Succession; treated as decorative (alt ''). Hero image is the shared 'image 16.png'.",
    ],
  },

  // ---------------------------------------------------------------------------
  {
    slug: "business-funding",
    title: "Business Funding",
    sections: [
      {
        type: "hero",
        data: {
          heading: "Business Funding",
          body: "Capital matched to businesses that are actually ready for it.",
          imageIds: [heroImage],
          cta: heroCta,
          variant: "band",
        },
      },
      {
        type: "steps",
        data: {
          eyebrow: "How we support you",
          heading: "We only make the introduction when there's real alignment.",
          intro:
            "We improve the odds of a successful raise by matching capital to businesses that actually meet investor criteria — not before. Our logic is simple: we win only when you win.",
          steps: [
            {
              title: "Investor Readiness",
              body: "If you're not yet ready to raise, we work directly with your leadership team to strengthen investment readiness — sharpening financial clarity, business structure, and positioning until you meet investor expectations.",
            },
            {
              title: "Capital Raise",
              body: "Once you're investment-ready, we facilitate targeted engagement with the capital providers who actually fit your mandate, sector, and transaction requirements — not a mass mailout to whoever will listen.",
            },
          ],
        },
      },
      {
        type: "card_grid",
        data: {
          heading:
            "Capital raised the right way doesn't just fund growth — it maximizes what your business is worth the day you exit.",
          intro:
            "We work across seven types of capital, matched to what your business and its stage actually call for.",
          columns: 3,
          cards: [
            {
              title: "Private Equity",
              body: "We connect established African businesses with private equity investors seeking scalable opportunities. Our team supports the entire process, from deal preparation and structuring to negotiation and closing, to ensure mutually beneficial outcomes.\n\nWe work with established, cash-generative businesses ready to bring in an institutional partner for growth capital or a partial exit.",
              imageId: asset(
                "new_images/68adea73590669a19f87111d_biz-img-1.webp.png",
                "Two colleagues celebrating a result while working on a laptop",
              ),
              items: [
                {
                  title: "Deal Preparation",
                  body: "Structuring your business and materials for institutional investors.",
                },
                {
                  title: "Investor Matching",
                  body: "Connecting you with PE investors aligned to your sector and stage.",
                },
                {
                  title: "Negotiation & Closing",
                  body: "Guiding terms through to a mutually beneficial close.",
                },
              ],
            },
            {
              title: "Private Debt",
              body: "We arrange flexible debt instruments tailored to the borrower’s cash flow and growth plans. By working closely with private lenders and debt funds, we secure financing that balances capital efficiency with sustainability.\n\nWe structure debt facilities that fund growth without giving up equity, matched to lenders who understand African markets.",
              imageId: asset("new_images/2.jpg", "Business professionals applauding in a meeting"),
              items: [
                {
                  title: "Instrument Structuring",
                  body: "Designing debt terms that match your cash flow and growth plans.",
                },
                {
                  title: "Lender Access",
                  body: "Connections to private lenders and debt funds across the region.",
                },
                {
                  title: "Capital Efficiency",
                  body: "Balancing leverage with long-term sustainability.",
                },
              ],
            },
            {
              title: "Venture Capital",
              body: "We help early and growth-stage companies access venture funding that accelerates innovation and market expansion. Our role includes investor matching, pitch preparation, and deal structuring to position startups for success.\n\nWe help founders raise from investors who back early and growth-stage companies, from first pitch through to a signed term sheet.",
              imageId: asset(
                "new_images/14.jpg",
                "Construction professional in a hard hat and safety vest holding plans and a phone",
              ),
              items: [
                {
                  title: "Investor Matching",
                  body: "Connecting founders to VCs aligned with their stage and sector.",
                },
                {
                  title: "Pitch Preparation",
                  body: "Sharpening your story and materials for investor scrutiny.",
                },
                {
                  title: "Deal Structuring",
                  body: "Structuring terms that protect founders and attract capital.",
                },
              ],
            },
            {
              title: "Family Offices",
              body: "Through our relationships with global family offices, we provide access to long-term, patient capital. We align businesses with family investors who share similar values, investment horizons, and strategic interests.\n\nWe connect businesses with family offices looking for long-term, values-aligned investments rather than a quick exit.",
              imageId: asset(
                "new_images/8.jpg",
                "Smiling farm worker carrying a crate of leafy greens in a greenhouse",
              ),
              items: [
                {
                  title: "Patient Capital",
                  body: "Access to long-term funding without short exit pressure.",
                },
                {
                  title: "Values Alignment",
                  body: "Matched with family investors who share your outlook.",
                },
                {
                  title: "Global Reach",
                  body: "Relationships spanning family offices across multiple regions.",
                },
              ],
            },
            {
              title: "Development Finance",
              body: "We partner with Development Finance Institutions (DFIs) and impact investors to fund projects that drive inclusive growth across Africa. Our team assists with proposal preparation, compliance, and investment readiness.\n\nWe help businesses with a clear development or impact case access funding from DFIs and impact investors.",
              imageId: asset("new_images/16.jpg", "Two colleagues discussing work over a laptop"),
              items: [
                {
                  title: "DFI Access",
                  body: "Direct relationships with Development Finance Institutions and impact funds.",
                },
                {
                  title: "Proposal Preparation",
                  body: "Building the case your funder needs to see.",
                },
                {
                  title: "Compliance & Readiness",
                  body: "Meeting the governance standards DFIs require.",
                },
              ],
            },
            {
              title: "Public Sector",
              body: "We collaborate with government agencies and public-private partnership (PPP) programs to design and finance large-scale infrastructure and social projects. Our experience ensures transparency, efficiency, and developmental impact.\n\nWe help structure and finance projects that combine public agency backing with private capital.",
              imageId: asset(
                "new_images/17.jpg",
                "Smiling man driving a car with a woman in the passenger seat",
              ),
              items: [
                {
                  title: "PPP Structuring",
                  body: "Designing partnerships between public agencies and private capital.",
                },
                {
                  title: "Transparency & Governance",
                  body: "Meeting the accountability standards public funding requires.",
                },
                {
                  title: "Developmental Impact",
                  body: "Financing structured around measurable public benefit.",
                },
              ],
            },
            {
              title: "Crowdfunding",
              body: "We help entrepreneurs tap into collective financing opportunities by connecting them with credible crowdfunding platforms. Our process ensures compliance, investor protection, and clear communication of the business case.\n\nWe help businesses raise from the crowd the right way, on platforms that are actually credible and compliant.",
              imageId: asset(
                "new_images/13.jpg",
                "Two businessmen talking at an outdoor café table",
              ),
              items: [
                {
                  title: "Platform Access",
                  body: "Connections to credible, vetted crowdfunding platforms.",
                },
                {
                  title: "Investor Protection",
                  body: "Compliance built in to protect backers and the business.",
                },
                {
                  title: "Clear Communication",
                  body: "A business case investors can understand and trust.",
                },
              ],
            },
          ],
        },
      },
      {
        type: "cta",
        data: {
          heading: "We have an extensive network of numerous funding partners",
          cta: { label: "Leave us a message", href: "/contact" },
          imageId: asset("new_images/156.png", ""),
          tone: "dark",
          overlay: "fade",
        },
      },
    ],
    review: [
      "Funding-type cards had no href in legacy; they expanded in place to show a second description (expandedDescription) and a detail list. Card body here = collapsed description + a second paragraph with the expanded description; detail list kept as `items`. Check the renderer shows this sensibly (the two paragraphs overlap in meaning).",
      "Card descriptions in legacy were template literals with hard line breaks; joined into single lines.",
      "Card sub-item titles had a trailing colon in legacy ('Deal Preparation:' etc.); colons removed as presentational.",
      "Legacy image alts were wrong/generic (five cards said 'Construction professional'); rewritten from image content. Stock photos don't match the funding types (e.g. a farm worker for Family Offices, a man driving for Public Sector, a construction worker for Venture Capital) — consider better imagery.",
      "'How we support you' intro and the two phases were one block in legacy; mapped to a single steps section (Phase 1/Phase 2 labels become step numbers).",
      "Unused data skipped: `_businessFundingServices` array (same seven types with icons new_images/image 7–13.svg) and the commented-out 'Funding opportunities available with African Aspirations' grid whose 'Learn more' links pointed to '#'. Also commented-out breadcrumbs and Meliuk-liuk.svg line.",
      "Hero image is the shared 'image 16.png'. Closing CTA background (156.png) treated as decorative (alt '').",
    ],
  },
];
