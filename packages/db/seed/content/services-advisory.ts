import { asset, type SeedService } from "../types";

/**
 * The five advisory practices, children of Business Consulting.
 * Title, summary and image come from the advisory hub cards
 * (legacy app/(routes)/business-consulting/advisory/page.tsx).
 * Review: the hub cards also had an `expandedDescription` (shown when a card is
 * expanded) that is not carried over here; see the advisory hub page seed.
 */
export const advisoryServices: SeedService[] = [
  {
    key: "insurance",
    title: "Insurance",
    summary:
      "Deep expertise across all insurance lines — Life, General, Health, Brokerage, and Reinsurance — with an integrated approach to value creation for insurance sector clients.",
    image: asset("new_images/1.jpg", "Insurance advisory"),
    pageSlug: "insurance",
    parentKey: "business-consulting",
  },
  {
    key: "actuarial-and-financial-modeling",
    title: "Actuarial & Financial Modeling",
    summary:
      "Global actuarial expertise applied to local realities — Product Development, Pricing, Experience Studies, Assumption Development, Valuation, and Financial Reporting.",
    image: asset("new_images/3.jpg", "Actuarial and financial modeling"),
    pageSlug: "actuarial-and-financial-modeling",
    parentKey: "business-consulting",
  },
  {
    key: "investment-and-asset-liability-management",
    title: "Investment & Asset Liability Management",
    summary:
      "Liability-Driven Investment strategies built on a clear understanding of liability emergence and characteristics, ensuring assets match what they support.",
    image: asset("new_images/4.jpg", "Investment and asset liability management"),
    pageSlug: "investment-and-asset-liability-management",
    parentKey: "business-consulting",
  },
  {
    key: "risk-management",
    title: "Risk Management",
    summary:
      "Defensive techniques to identify, assess, mitigate, monitor, and report on business risk — paired with offensive techniques that embed risk management into growth.",
    image: asset("new_images/5.jpg", "Risk management"),
    pageSlug: "risk-management",
    parentKey: "business-consulting",
  },
  {
    key: "compliance",
    title: "Compliance",
    summary:
      "Effective compliance frameworks aligned with regulatory requirements and international best practices, strengthening governance and business integrity.",
    image: asset("new_images/6.jpg", "Compliance"),
    pageSlug: "compliance",
    parentKey: "business-consulting",
  },
];
