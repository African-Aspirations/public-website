/**
 * Site-wide content transcribed from the legacy site:
 *  - components/footer.tsx (contact info, socials, footer columns)
 *  - app/layout.tsx (default title/description)
 *  - components/client-navbar.tsx (header menu, "Contact Us" CTA)
 *  - app/(routes)/about/page.tsx + components/leadership-card.tsx (team)
 *  - components/global-partner-section.tsx (TBA partner)
 *  - app/(routes)/page.tsx service cards (main services)
 */
import {
  asset,
  type SeedNav,
  type SeedPartner,
  type SeedService,
  type SeedSiteSettings,
  type SeedTeamMember,
} from "../types";

export const siteSettings: SeedSiteSettings = {
  orgName: "African Aspirations",
  // Footer address/phone are verbatim. Review: "Osu. Accra" punctuation, and the phone number
  // "+233 030 398 2318" keeps the trunk "0" after the country code (tel: link was "+233030 398 2318").
  address: "6 Koi Street, Osu. Accra, Ghana",
  phone: "+233 030 398 2318",
  email: "connect@africanaspirations.com",
  socials: [
    { label: "LinkedIn", url: "http://linkedin.com/company/african-aspirations/" },
    { label: "Facebook", url: "https://www.facebook.com/share/1BaJ73G9gw/?mibextid=wwXIfr" },
    { label: "Instagram", url: "http://instagram.com/africanasp.gh/" },
    { label: "X", url: "https://x.com/AfricanAspGh" },
  ],
  defaultSeoTitle: "African Aspirations",
  defaultSeoDescription: "African Aspirations fuels Africa's success.",
  // Header logo (full-colour, for light backgrounds). The footer used a light monochrome variant:
  // "new_images/Copy of AA Slides v5 Final 1.svg".
  logo: asset("new_images/image 14.svg", "African Aspirations"),
  // Navbar "Contact Us" button pointed to the Fillout form.
  ctaLabel: "Contact Us",
  ctaUrl: "/contact",
};

export const nav: SeedNav = {
  header: [
    {
      label: "Why AA",
      pageSlug: "about",
      children: [
        {
          label: "Our philosophy",
          description: "The thinking behind how we work",
          pageSlug: "about",
        },
        // Legacy anchors (#our-team, #our-global-partner): check the new About page renders these ids.
        { label: "Leadership", description: "Meet the team", url: "/about#our-team" },
        { label: "Our network", url: "/about#our-global-partner" },
      ],
    },
    {
      label: "Services",
      pageSlug: "business-consulting",
      children: [
        {
          label: "Business Consulting",
          description: "Build an institution, not just a business",
          pageSlug: "business-consulting",
        },
        {
          label: "Business Funding",
          description: "Capital matched to businesses that are ready",
          pageSlug: "business-funding",
        },
        {
          label: "Business Brokerage",
          description: "Sell to a serious, qualified buyer",
          pageSlug: "business-brokerage",
        },
        // No description in the legacy navbar.
        { label: "Business Valuation", pageSlug: "business-valuation" },
      ],
    },
    { label: "Listings", pageSlug: "listings" },
    { label: "Insights", pageSlug: "media-and-insights" },
  ],
  footer: {
    Stakeholders: [
      { label: "For Sellers", pageSlug: "business-brokerage" },
      { label: "For Buyers", pageSlug: "listings" },
      { label: "For Investors", pageSlug: "business-funding" },
      { label: "Business Advisors", pageSlug: "business-consulting" },
    ],
    // Review: Pitch Books, CIM and Industry Research Report all pointed to the brokerage page,
    // which does not mention them.
    "Our products": [
      { label: "Valuation Report", pageSlug: "business-valuation" },
      { label: "Pitch Books", pageSlug: "business-brokerage" },
      { label: "CIM", pageSlug: "business-brokerage" },
      { label: "Industry Research Report", pageSlug: "business-brokerage" },
    ],
    "Other Links": [
      { label: "TBA Ghana", url: "https://tworld.com.gh/" },
      // Typo fix: legacy label was "Services Providers".
      { label: "Service Providers", pageSlug: "business-consulting" },
      // Legacy pointed to the Fillout form.
      { label: "Refer a business", pageSlug: "contact" },
    ],
    // Legacy bottom bar showed "Privacy Policy" and "Terms of Use" as plain text (no links).
    // The "Admin" link (/auth/login) is intentionally dropped.
    Legal: [
      { label: "Privacy Policy", pageSlug: "privacy-policy" },
      { label: "Terms of Use", pageSlug: "terms-of-use" },
    ],
  },
};

export const teamMembers: SeedTeamMember[] = [
  {
    key: "nigel-nunoo",
    name: "Nigel Nunoo",
    role: "Founder & CEO",
    credentials: "MBA, CFA, CFE",
    summary: "Over 20 years of experience in global financial services and investment strategy.",
    // Review: the second paragraph repeats the summary sentence and then says "over 25 years";
    // credentials say "MBA, CFA, CFE" but the last paragraph says "MBA, CFA, FSA".
    bio: [
      "Nigel Nunoo is an entrepreneurial international business executive with over 20 years of experience driving profitable growth and transformation in the global financial services industry. A proven strategist and visionary, Nigel has designed and implemented corporate, business, investment, and risk management strategies that have delivered measurable success across the U.S., Africa, and Europe.",
      "Over 20 years of experience in global financial services and investment strategy.",
      "Nigel has pioneered the institutionalization process with over 25 years of experience in middle-market M&A, private equity and investment banking. Through his career, he has closed hundreds of transactions with a particular focus on cross-border M&A, Africa, minerals, resources, business franchises, and agri-businesses.",
      "As Founder of African Aspirations, Nigel provides overall vision and leadership for the Group and its three subsidiaries; Business Brokerage, Business Consulting, and Business Funding. His mission is to position African Aspirations as a premier Pan-African business development platform that empowers entrepreneurs, investors, and corporations to grow and thrive across markets.",
      "Respected for his professional rigor and global credentials; MBA, Chartered Financial Analyst (CFA), and Fellow of the Society of Actuaries (FSA), Nigel ensures that African Aspirations operates with world-class standards of excellence. Above all, his goal is to ensure that every SME achieves its aspirations through transformative, professional, and impactful partnerships.",
    ].join("\n\n"),
    photo: asset("new_images/image 19.png", "Portrait of Nigel Nunoo"),
  },
  {
    key: "richard-osei",
    name: "Richard Osei",
    role: "COO",
    credentials: "MBA, CPA, CIA",
    summary: "Seasoned finance/operations leader overseeing Transworld Ghana & group execution",
    bio: [
      "Richard Osei is a results-driven executive with over 15 years of experience in the financial sector, specializing in compliance, risk management, and deal execution. Renowned for his operational precision and analytical expertise, Richard has successfully led organizations and entrepreneurs through complex financial and business challenges across Ghana, Nigeria, and The Gambia.",
      "As Chief Operations Officer of African Aspirations, Richard is the engine behind the Group’s daily execution. He leads the Business Brokerage subsidiary and ensures seamless integration across the Consulting and Funding divisions. His role encompasses building operational systems, ensuring financial transparency, and structuring business processes that minimize risks and maximize opportunities for clients.",
      "Richard’s regional exposure and financial expertise make him a trusted partner for SMEs seeking to buy, sell, restructure, or expand their businesses. His leadership is defined by a process-driven, detail-oriented mindset that guarantees transactions are not only successful but sustainable.",
      "Armed with an MBA, Certified Public Accountant (CPA), and Certified Internal Auditor (CIA) designations, Richard brings a rare combination of technical expertise and strategic foresight to African Aspirations. His mission is clear: to ensure that the Group delivers flawless execution and enables every SME to achieve its aspirations across brokerage, consulting, and funding.",
    ].join("\n\n"),
    photo: asset("new_images/image 22.png", "Portrait of Richard Osei"),
  },
  {
    key: "cleland-goffie-bruce-jnr",
    name: "Cleland Goffie Bruce Jnr",
    role: "Board Chair",
    // Review: credentials "PhD, MBA, CPA, FCCA" do not match the bio (ACII, FIIG, DipFM, MA).
    credentials: "PhD, MBA, CPA, FCCA",
    summary:
      "Veteran insurance & financial services executive; pioneer in Ghana’s insurance industry.",
    bio: [
      "C.C. Bruce is a highly accomplished executive with over 30 years of leadership in financial services, governance, and organizational transformation. Recognized as a thought leader across Africa, he has shaped industry policies, guided organizations to growth, and provided strategic oversight that has strengthened both national and regional markets.",
      "As Board Chair of African Aspirations, C.C. Bruce provides governance, oversight, and strategic direction to ensure the Group remains anchored in integrity, professionalism, and client success. His leadership influences every aspect of African Aspirations’ expansion across its three subsidiaries; Business Brokerage, Business Consulting, and Business Funding cementing the Group’s role as a trusted partner for entrepreneurs and investors across Africa and the diaspora.",
      "C.C. Bruce’s credentials include Associate of the Chartered Insurance Institute (ACII, UK), Fellow of the Insurance Institute of Ghana (FIIG), a Diploma in Financial Management (DipFM, ACCA), and a Master of Arts in Leading Innovation and Change from York St. John University, UK. His distinguished career and reputation for excellence bring stability, authority, and vision to African Aspirations.",
      "With his guidance, African Aspirations is positioned to redefine business development across Africa. His ultimate goal and that of the Group is to ensure that every SME achieves its aspirations and contributes to Africa’s sustainable economic growth story.",
    ].join("\n\n"),
    photo: asset("new_images/image 20.png", "Portrait of Cleland Goffie Bruce Jnr"),
  },
];

export const partners: SeedPartner[] = [
  {
    key: "tba",
    name: "Transworld Business Advisors",
    // Legacy `description` + `detailText` defaults (no page overrode them).
    description: [
      "African Aspirations proudly partners with Transworld Business Advisors (TBA), the world's largest business brokerage network.",
      "Through this partnership, we bring Transworld's proven systems, valuation expertise, and international investor reach to African markets. Operating as Transworld Business Advisors Ghana, we connect African business owners with qualified local and global buyers while ensuring confidentiality, fair valuation, and end-to-end transaction support. Together, African Aspirations and TBA are creating a seamless bridge between African enterprises and global opportunity.",
    ].join("\n\n"),
    // From the footer "TBA Ghana" link; the legacy partner section itself had no link.
    url: "https://tworld.com.gh/",
    logo: asset("new_images/TBALogo_origin.webp", "Transworld Business Advisors logo"),
    stats: [
      { value: "250", label: "Global Offices" },
      { value: "600,000+", label: "Active Investor Network" },
      { value: "1,000+", label: "Global Active Agents" },
    ],
  },
];

/** Summaries from the home page service cards; images are the card images. */
export const mainServices: SeedService[] = [
  {
    key: "business-consulting",
    title: "Business Consulting",
    summary:
      "Strategic advice to strengthen governance, scale with discipline, and build a business that can outlast its founder.",
    image: asset("new_images/15.jpg", "Man in a cap and glasses trimming a hedge outdoors"),
    pageSlug: "business-consulting",
  },
  {
    key: "business-funding",
    title: "Business Funding",
    summary: "Access to capital that supports expansion, resilience, and long-term value creation.",
    image: asset("new_images/8.jpg", "Smiling greenhouse worker holding a crate of fresh lettuce"),
    pageSlug: "business-funding",
  },
  {
    key: "business-valuation",
    title: "Business Valuation",
    summary:
      "Independent valuation support that clarifies enterprise value for fundraising, negotiations, and strategic planning.",
    image: asset("new_images/16.jpg", "Two colleagues reviewing work together at a laptop"),
    pageSlug: "business-valuation",
  },
  {
    key: "business-brokerage",
    title: "Business Brokerage",
    summary:
      "A trusted path to buyer matching, negotiation, and a smooth exit when the time is right.",
    image: asset("new_images/13.jpg", "Two businessmen in suits talking at an outdoor café table"),
    pageSlug: "business-brokerage",
  },
];
