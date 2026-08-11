"use client";

import axios from "axios";
import { LayoutDashboard, ListTree, LogOut, Store, Tags } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/auth/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/auth/admin/listings", label: "Listings", icon: Store },
  { href: "/auth/admin/categories", label: "Categories", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, onLogout } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      onLogout();
      router.push("/");
    }
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-gray-100 border-r bg-white">
      <Link
        href="/"
        className="flex items-center border-gray-100 border-b px-6 py-5"
      >
        <Image
          src="/new_images/image 14.svg"
          alt="African Aspirations"
          width={212}
          height={103}
          className="h-10 w-auto"
        />
      </Link>

      <div className="px-6 pt-6 pb-2">
        <p className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
          Listings admin
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/auth/admin"
              ? pathname === "/auth/admin"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
                isActive
                  ? "bg-[#17351f] text-white"
                  : "text-stone-600 hover:bg-stone-100",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-gray-100 border-t p-3">
        {data?.name || data?.email ? (
          <div className="px-3 pb-2">
            <p className="truncate font-medium text-stone-700 text-xs">
              Signed in as {data.name || data.email}
            </p>
          </div>
        ) : null}
        <Link
          href="/listings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm text-stone-600 transition-colors hover:bg-stone-100"
        >
          <ListTree className="size-4" />
          View public listings
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-red-600 text-sm transition-colors hover:bg-red-50"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
