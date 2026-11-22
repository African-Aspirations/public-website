"use client";
import { usePathname } from "next/navigation";
import { labelFor } from "@/lib/nav";

export function PageTitle() {
  return <span className="font-medium">{labelFor(usePathname())}</span>;
}
