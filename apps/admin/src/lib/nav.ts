import {
  FileText,
  Handshake,
  Images,
  Inbox,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Mail,
  Menu,
  Newspaper,
  Settings,
  Store,
  Users,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** The admin's routes, in sidebar order. Content is the collapsible group. */
export const TOP: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/listings", label: "Listings", icon: Store },
];
export const CONTENT: NavItem[] = [
  { href: "/pages", label: "Pages", icon: FileText },
  { href: "/insights", label: "Insights", icon: Newspaper },
  { href: "/team", label: "Team", icon: Users },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/services", label: "Services & FAQs", icon: ListChecks },
  { href: "/media", label: "Media", icon: Images },
  { href: "/navigation", label: "Navigation", icon: Menu },
];
export const INBOX: NavItem[] = [
  { href: "/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/subscribers", label: "Subscribers", icon: Mail },
];
export const SETTINGS: NavItem = { href: "/settings", label: "Settings", icon: Settings };

export const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

export function labelFor(path: string) {
  return [...TOP, ...CONTENT, ...INBOX, SETTINGS].find((i) => isActive(path, i.href))?.label ?? "";
}
