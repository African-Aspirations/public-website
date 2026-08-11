// components/Breadcrumbs.tsx
"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBreadcrumbTrail } from "@/lib/getBreadCrumbs";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  /** "light" sits on a white page background (default). "dark" sits inside a colored hero block. */
  variant?: "light" | "dark";
}

const slugToLabel = (slug: string) =>
  decodeURIComponent(slug)
    .replace(/-and-/gi, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumbs({ variant = "light" }: BreadcrumbsProps) {
  const pathname = usePathname() ?? "/";
  const trail = getBreadcrumbTrail(pathname);

  // fallback: build crumbs from pathname segments (keeps previous behavior)
  const fallbackCrumbs = (p: string) => {
    const segments = p.split("/").filter(Boolean);
    return segments.map((seg, i) => {
      const href = `/${segments.slice(0, i + 1).join("/")}`;
      return { href, title: slugToLabel(seg) };
    });
  };

  const crumbs = trail.length ? trail : fallbackCrumbs(pathname);

  if (!crumbs.length) return null;

  const labelFromHref = (href?: string) => {
    const slug = href?.split("/").filter(Boolean).pop();
    return slug ? slugToLabel(slug) : "";
  };

  const isDark = variant === "dark";

  const content = (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      {crumbs.map((c, i) => {
        const label = c.title || labelFromHref(c.href);
        const isLast = i === crumbs.length - 1 || !c.href;
        return (
          <div
            key={`${c.href ?? c.title}-${i}`}
            className="flex items-center gap-1.5"
          >
            {i > 0 && (
              <ChevronRight
                size={12}
                className={isDark ? "text-white/40" : "text-[#B9C9AC]"}
              />
            )}
            {isLast ? (
              <span
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-[#1E1E1E]",
                )}
              >
                {label}
              </span>
            ) : (
              <Link
                href={c.href as string}
                className={cn(
                  "font-medium transition-colors",
                  isDark
                    ? "text-white/70 hover:text-white"
                    : "text-[#81878A] hover:text-[#1E1E1E]",
                )}
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );

  if (isDark) return content;

  return (
    <div className="mx-auto mb-3 max-w-[90rem] px-4 md:px-8">{content}</div>
  );
}
