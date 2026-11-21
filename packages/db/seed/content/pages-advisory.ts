import { asset, type SeedPage, type SeedSection } from "../types";

/**
 * The five advisory practice pages. In the legacy site they share one template:
 * HeroSection, an intro paragraph, a service grid, and a BottomHero CTA.
 */

const heroImage = asset(
  "new_images/image 16.png",
  "Consultant in a suit working at a laptop in front of a screen showing a money bag and a rising growth chart",
);

const hero = (heading: string): SeedSection => ({
  type: "hero",
  data: {
    heading,
    imageIds: [heroImage],
    cta: { label: "Reach out to us", href: "/contact" },
    variant: "band",
  },
});

const intro = (body: string): SeedSection => ({ type: "rich_text", data: { body } });

const closingCta: SeedSection = {
  type: "cta",
  data: {
    heading: "We are experts at Institutionalization",
    cta: { label: "Leave us a message", href: "/contact" },
    imageId: asset("new_images/156.png", ""),
    tone: "dark",
    overlay: "fade",
  },
};

const andManyMore = { title: "and many more..." };

const sharedReview = [
  "Hero CTA 'Reach out to us' (HeroSection default) and closing CTA 'Leave us a message' (BottomHero) both pointed to the Fillout form; now /contact.",
  "Each service in the legacy data array has a `features` list (brokerage boilerplate such as 'Buyer qualification', 'Market matching') that the legacy template NEVER RENDERED. Treated as unused data and NOT carried into card `items`.",
  "Service descriptions were hard-wrapped template literals (copied from a PDF); line breaks/leading newlines joined into single spaces (they collapsed in the rendered HTML anyway).",
  "Skipped commented-out code: 'AA line' Meliuk-liuk.svg image under the hero and a 'See more'/'Learn more' button per service card (no target).",
  "Legacy hero breadcrumbs came from the URL; these pages are top-level (/insurance …), so the band hero shows none. Consider nesting them under /business-consulting/advisory/ (with redirects) to restore the trail.",
  "The service-grid <h2> repeats the page title, so the heading appears twice on the page (hero + grid). Consider dropping or rewording.",
];

export const advisoryPages: SeedPage[] = [
  {
    slug: "insurance",
    title: "Insurance",
    sections: [
      hero("Insurance"),
      intro(
        "We help insurers and financial institutions strengthen performance, manage risk intelligently, and create the kind of operational resilience that supports durable growth and long-term value.",
      ),
      {
        type: "card_grid",
        data: {
          heading: "Insurance",
          columns: 3,
          cards: [
            {
              title: "Strategic Growth & Innovation",
              body: "We help insurers expand market reach, create new products, and embed innovation across the value chain. Our approach combines market intelligence, digital enablement, and operational efficiency.",
            },
            {
              title: "Financial Resilience",
              body: "We strengthen solvency and capital efficiency by developing robust financial frameworks and stress-tested capital models. Our goal is to enhance profitability and regulatory confidence.",
            },
            {
              title: "Technical Excellence",
              body: "We optimize underwriting, pricing, and claims processes to improve risk management and operational performance. Our experts ensure technical capabilities evolve with emerging industry standards.",
            },
            {
              title: "Operations & People Enablement",
              body: "We streamline operations and build people capabilities through training, change management, and process automation. Our focus is creating agile, high-performing insurance organizations.",
            },
            {
              title: "Insurtech",
              body: "We help insurers adopt digital technologies and data-driven tools that improve customer engagement, risk assessment, and operational agility, enabling a truly modern insurance experience.",
            },
            andManyMore,
          ],
        },
      },
      closingCta,
    ],
    review: [
      ...sharedReview,
      "The grid ended with a highlighted 'and many more...' tile; kept as a final title-only card. Decide whether to keep it.",
      "Legacy component was named BusinessBrokeragePage and its data array businessBrokerageServices (copy-paste of the brokerage page).",
    ],
  },
  {
    slug: "actuarial-and-financial-modeling",
    legacyPaths: ["/acturial-and-financial-modeling"],
    title: "Actuarial & Financial Modeling",
    sections: [
      hero("Actuarial & Financial Modeling"),
      intro(
        "Clear financial insight strengthens every strategic decision. We help clients model value, understand risk, and make better choices that support growth, funding, and long-term exit readiness.",
      ),
      {
        type: "card_grid",
        data: {
          heading: "Actuarial & Financial Modeling",
          columns: 3,
          cards: [
            {
              title: "Pricing Strategy",
              body: "We design accurate, market-reflective pricing models that balance competitiveness with profitability. Our actuarial experts ensure your pricing decisions are grounded in robust data and predictive analysis.",
            },
            {
              title: "Capital Management",
              body: "We assist clients in optimizing capital allocation and achieving solvency objectives. Our models align risk, performance, and capital to sustain growth and shareholder value.",
            },
            {
              title: "Solvency",
              body: "We perform solvency assessments and develop regulatory reporting models that comply with both local and international frameworks. Our solutions enhance transparency and governance.",
            },
            {
              title: "Stochastic Modeling",
              body: "We employ advanced simulations to forecast a range of possible financial outcomes, supporting clients in planning for uncertainty and managing long-term risk.",
            },
            {
              title: "Insurance-Linked Securities",
              body: "We help design and structure insurance-linked securities that transfer risk to capital markets, unlocking new sources of financing for insurers.",
            },
            {
              title: "Predictive Analytics",
              body: "We apply data science and machine learning to improve underwriting, claims management, and customer segmentation, giving clients a competitive advantage through data-driven decision-making.",
            },
            andManyMore,
          ],
        },
      },
      closingCta,
    ],
    review: [
      ...sharedReview,
      "Typo fixed: 'Acturial & Financial Modeling' -> 'Actuarial & Financial Modeling' (hero title and grid heading). Legacy URL /acturial-and-financial-modeling redirects here.",
      "Trailing space removed from card title 'Capital Management '.",
      "The grid ended with a highlighted 'and many more...' tile; kept as a final title-only card. Decide whether to keep it.",
      "Intro copy mentions 'growth, funding, and long-term exit readiness' — reads as generic business-owner copy rather than actuarial-specific; confirm intended.",
    ],
  },
  {
    slug: "investment-and-asset-liability-management",
    title: "Investment & Asset Liability Management",
    sections: [
      hero("Investment & Asset Liability Management"),
      intro(
        "Strong asset-liability management protects capital and improves resilience. It gives business owners and institutions the clarity to make disciplined decisions in complex markets.",
      ),
      {
        type: "card_grid",
        data: {
          heading: "Investment & Asset Liability Management",
          columns: 3,
          cards: [
            {
              title: "Investment Strategy",
              body: "We build customized investment frameworks that define risk-return objectives, liquidity needs, and asset class allocation to achieve long-term performance goals.",
            },
            {
              title: "Strategic Asset Allocation",
              body: "We design diversified portfolios that optimize growth potential while maintaining capital preservation across economic cycles.",
            },
            {
              title: "Tactical Asset Allocation",
              body: "We identify short-term opportunities in global and regional markets to enhance portfolio returns without deviating from strategic objectives.",
            },
            {
              title: "Investment Limits",
              body: "We develop investment limit frameworks that balance opportunity and risk, ensuring regulatory compliance and internal control.",
            },
            {
              title: "Investment Policy Statement",
              body: "We prepare comprehensive Investment Policy Statements (IPS) that document governance, strategy, and decision-making parameters for institutional investors.",
            },
            andManyMore,
          ],
        },
      },
      closingCta,
    ],
    review: [
      ...sharedReview,
      "The grid ended with a highlighted 'and many more...' tile; kept as a final title-only card. Decide whether to keep it.",
    ],
  },
  {
    slug: "risk-management",
    title: "Risk Management",
    sections: [
      hero("Risk Management"),
      intro(
        "Good risk management enables growth rather than slowing it down. It helps owners protect what they have built while creating the discipline needed to scale with confidence.",
      ),
      {
        type: "card_grid",
        data: {
          heading: "Risk Management opportunities available with African Aspirations",
          columns: 3,
          cards: [
            {
              title: "Three Lines of Defense",
              body: "We implement the Three Lines of Defense model to clarify accountability across governance, management, and assurance, strengthening enterprise oversight and control.",
              imageId: asset("new_images/image 12.svg", ""),
            },
            {
              title: "Risk Appetite",
              body: "We design and document risk appetite frameworks that align strategic ambitions with tolerance levels, ensuring leadership decisions are informed and balanced.",
              imageId: asset("new_images/image 7.svg", ""),
            },
            {
              title: "Risk Culture",
              body: "We foster risk-aware cultures that embed accountability and proactive decision-making at every organizational level.",
              imageId: asset("new_images/image 8.svg", ""),
            },
            {
              title: "Risk Management Process",
              body: "We build and operationalize risk management processes covering identification, assessment, mitigation, and monitoring tailored to client objectives.",
              imageId: asset("new_images/image 10.svg", ""),
            },
            {
              title: "Risk Register",
              body: "We develop and maintain dynamic risk registers that prioritize exposures, track mitigation, and provide leadership with actionable insights.",
              imageId: asset("new_images/image 9.svg", ""),
            },
            {
              title: "Risk Event Management",
              body: "We support clients in responding to and learning from incidents, building resilience through structured root-cause analysis and remediation planning.",
              imageId: asset("new_images/image 11.svg", ""),
            },
          ],
        },
      },
      closingCta,
    ],
    review: [
      "Hero CTA 'Reach out to us' (HeroSection default) and closing CTA 'Leave us a message' (BottomHero) both pointed to the Fillout form; now /contact.",
      "Unlike the other four pages, this page uses a different legacy layout: a vertical list of bordered cards, each with an SVG illustration (new_images/image 7–12.svg). Transcribed as a card_grid with card images.",
      'Card illustrations given alt "" (decorative, sit beside the card title). Legacy used the full description as alt text.',
      "Service grid heading styled 'Aspirations' in a highlight colour; styling dropped.",
      "Service descriptions were hard-wrapped template literals; line breaks joined into single spaces.",
      "Skipped commented-out code: 'AA line' Meliuk-liuk.svg image under the hero and a 'Learn more' link per card (href=\"#\").",
      "Legacy hero breadcrumbs came from the URL; these pages are top-level (/insurance …), so the band hero shows none. Consider nesting them under /business-consulting/advisory/ (with redirects) to restore the trail.",
      "No 'and many more...' tile on this page (the other four have one).",
    ],
  },
  {
    slug: "compliance",
    title: "Compliance",
    sections: [
      hero("Compliance"),
      intro(
        "Strong compliance protects value. It reinforces trust, sharpens governance, and gives owners and investors confidence that the business can grow without unnecessary exposure.",
      ),
      {
        type: "card_grid",
        data: {
          heading: "Compliance",
          columns: 3,
          cards: [
            {
              title: "Regulatory Compliance",
              body: "We design compliance frameworks and control systems to help organizations navigate complex regulatory environments with confidence and precision.",
            },
            {
              title: "Governance & Ethics",
              body: "We strengthen governance structures and embed ethical principles that promote accountability and responsible corporate conduct.",
            },
            {
              title: "AML & Financial Crime",
              body: "We help clients establish anti-money-laundering and financial crime prevention programs that meet global standards and reduce reputational risk.",
            },
            {
              title: "Compliance Risk Assessment",
              body: "We conduct detailed assessments to identify, evaluate, and mitigate compliance-related risks, supporting effective oversight and informed decision-making.",
            },
            {
              title: "Regulatory Reporting",
              body: "We design and manage efficient reporting frameworks to ensure accuracy, timeliness, and transparency in regulatory submissions.",
            },
            {
              title: "Compliance Training & Monitoring",
              body: "We develop training programs and monitoring systems that build compliance culture and ensure continuous adherence to policies and regulations.",
            },
            andManyMore,
          ],
        },
      },
      closingCta,
    ],
    review: [
      ...sharedReview,
      "COPY-PASTED BROKERAGE TEXT: the legacy `features` arrays on this page are brokerage boilerplate ('Buyer qualification', 'Market matching', 'Transaction support', 'Due diligence assistance', 'Business valuation', 'Buyer screening', 'Verified listings', 'Diverse portfolio', etc.) and have nothing to do with compliance. They were never rendered, so they are NOT included here. If feature bullets are wanted, real compliance copy must be written.",
      "The grid ended with a highlighted 'and many more...' tile; kept as a final title-only card. Decide whether to keep it.",
    ],
  },
];
