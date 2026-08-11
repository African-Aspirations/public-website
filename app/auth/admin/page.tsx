"use client";

import axios from "axios";
import { Building2, Coins, MapPin, Plus, Tags } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useModal } from "@/hooks/use-modal-store";

type Listing = {
  id: string;
  name: string;
  location?: string | null;
  price?: number | null;
  currency?: string | null;
  created_at?: string;
  category?: { label?: string | null } | null;
};

type Category = { id: string; label: string };

function formatMoney(value: number | null | undefined, currency = "USD") {
  if (value == null) return "Undisclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboard() {
  const { onOpen } = useModal();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get("/api/products/"),
        axios.get("/api/categories/"),
      ]);
      setListings(productsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalValue = listings.reduce(
      (sum, listing) => sum + (listing.price ?? 0),
      0,
    );
    const withPrice = listings.filter((listing) => listing.price != null);
    const avgPrice = withPrice.length ? totalValue / withPrice.length : 0;
    const locations = new Set(
      listings.map((listing) => listing.location).filter(Boolean),
    );

    return {
      totalListings: listings.length,
      totalValue,
      avgPrice,
      totalCategories: categories.length,
      totalLocations: locations.size,
    };
  }, [listings, categories]);

  const recentListings = listings.slice(0, 6);

  return (
    <div className="p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-3xl text-stone-950 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-stone-500 text-sm">
            An overview of the business listings on African Aspirations.
          </p>
        </div>
        <Button onClick={() => onOpen("createProduct", { onSuccess: load })}>
          <Plus className="mr-2 h-4 w-4" /> Add Listing
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Active listings"
              value={String(stats.totalListings)}
            />
            <StatCard
              icon={Coins}
              label="Combined asking value"
              value={formatMoney(stats.totalValue)}
            />
            <StatCard
              icon={Tags}
              label="Categories"
              value={String(stats.totalCategories)}
            />
            <StatCard
              icon={MapPin}
              label="Locations covered"
              value={String(stats.totalLocations)}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-stone-100 border-b px-6 py-5">
              <h2 className="font-semibold text-lg text-stone-950">
                Recent listings
              </h2>
              <Link
                href="/auth/admin/listings"
                className="font-medium text-[#17351f] text-sm hover:underline"
              >
                View all
              </Link>
            </div>

            {recentListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <p className="text-stone-500">
                  No listings yet. Add your first business listing to get
                  started.
                </p>
                <Button onClick={() => onOpen("createProduct", { onSuccess: load })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Listing
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-stone-400 text-xs uppercase tracking-[0.08em]">
                      <th className="px-6 py-3 font-medium">Business</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Location</th>
                      <th className="px-6 py-3 font-medium">Asking price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="border-stone-100 border-t"
                      >
                        <td className="px-6 py-4 font-medium text-stone-900">
                          {listing.name}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {listing.category?.label || "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {listing.location || "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {formatMoney(listing.price, listing.currency || "USD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-[#f1fbe6] text-[#17351f]">
        <Icon className="size-4" />
      </div>
      <p className="mt-4 font-semibold text-2xl text-stone-950">{value}</p>
      <p className="text-stone-500 text-sm">{label}</p>
    </div>
  );
}
