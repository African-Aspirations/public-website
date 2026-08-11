"use client";

import {
  ArrowUpRight,
  FilterX,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomCTASection from "@/components/bottom-cta-section";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";

type ListingItem = {
  id: string;
  name: string;
  desc: string;
  imageUrl?: string | null;
  link?: string | null;
  created_at?: string | null;
  price?: number | null;
  currency?: string | null;
  location?: string | null;
  sde?: number | null;
  downPayment?: number | null;
  category?: { label?: string | null; desc?: string | null } | null;
};

type ListingWithPrice = ListingItem & {
  price: number | null;
  priceLabel: string;
  region: string;
};

type SortOption = "newest" | "price-low" | "price-high";

function getListingPrice(listing: ListingItem) {
  const price = listing.price ?? null;
  if (price == null) return { price: null, priceLabel: "Price on request" };

  return {
    price,
    priceLabel: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: listing.currency || "USD",
      maximumFractionDigits: 0,
    }).format(price),
  };
}

function getRegion(listing: ListingItem) {
  if (!listing.location) return "Ghana";
  // Prefer the first segment (e.g. "Accra Metropolitan" from
  // "Accra Metropolitan, Greater Accra Region") so the badge stays compact.
  return listing.location.split(",")[0].trim();
}

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadListings = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load listings");
        const data: unknown = await response.json();
        if (active)
          setListings(Array.isArray(data) ? (data as ListingItem[]) : []);
      } catch (error) {
        console.error("Failed to load listings", error);
        if (active) setListings([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadListings();
    try {
      const storedFavorites = window.localStorage.getItem("saved-listings");
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    } catch {
      window.localStorage.removeItem("saved-listings");
    }

    return () => {
      active = false;
    };
  }, []);

  const enrichedListings = useMemo<ListingWithPrice[]>(
    () =>
      listings.map((listing) => ({
        ...listing,
        ...getListingPrice(listing),
        region: getRegion(listing),
      })),
    [listings],
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          enrichedListings
            .map((listing) => listing.category?.label)
            .filter(Boolean),
        ),
      ) as string[],
    [enrichedListings],
  );

  const knownPrices = useMemo(
    () =>
      enrichedListings
        .map((listing) => listing.price)
        .filter((price): price is number => price !== null),
    [enrichedListings],
  );
  const minimumPrice = knownPrices.length ? Math.min(...knownPrices) : 0;
  const maximumPrice = knownPrices.length ? Math.max(...knownPrices) : 0;

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = priceRange.min === "" ? null : Number(priceRange.min);
    const max = priceRange.max === "" ? null : Number(priceRange.max);

    return enrichedListings
      .filter((listing) => {
        const searchableText =
          `${listing.name} ${listing.desc} ${listing.category?.label ?? ""} ${listing.region}`.toLowerCase();
        const matchesSearch = !query || searchableText.includes(query);
        const matchesCategory =
          !selectedCategory || listing.category?.label === selectedCategory;
        const matchesMinimum =
          min === null || (listing.price !== null && listing.price >= min);
        const matchesMaximum =
          max === null || (listing.price !== null && listing.price <= max);
        return (
          matchesSearch && matchesCategory && matchesMinimum && matchesMaximum
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-low")
          return (
            (a.price ?? Number.POSITIVE_INFINITY) -
            (b.price ?? Number.POSITIVE_INFINITY)
          );
        if (sortBy === "price-high")
          return (
            (b.price ?? Number.NEGATIVE_INFINITY) -
            (a.price ?? Number.NEGATIVE_INFINITY)
          );
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      });
  }, [enrichedListings, priceRange, searchQuery, selectedCategory, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const updated = current.includes(id)
        ? current.filter((favorite) => favorite !== id)
        : [...current, id];
      window.localStorage.setItem("saved-listings", JSON.stringify(updated));
      return updated;
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "" ||
    priceRange.min !== "" ||
    priceRange.max !== "";

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-stone-950">
      <ClientNavbar />
      <main>
        <section className="relative overflow-hidden bg-[#17351f] px-4 pb-20 pt-32 sm:pt-40 md:px-8">
          <div className="relative mx-auto max-w-[90rem]">
            <h1 className="max-w-3xl font-semibold text-4xl tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover verified deals across Ghana.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Explore exceptional businesses, investment opportunities, and
              growth-ready ventures with the support of trusted advisors.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-black/20">
              <label className="relative flex min-w-[220px] flex-1 items-center">
                <Search className="pointer-events-none absolute left-3 size-4 text-stone-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by business, industry, or location"
                  aria-label="Search listings"
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pr-3 pl-9 text-sm text-stone-900 outline-none transition focus:border-[#739f46] focus:ring-2 focus:ring-[#dce9c9]"
                />
              </label>

              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                aria-label="Filter by category"
                className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 outline-none transition focus:border-[#739f46]"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                value={priceRange.min}
                onChange={(event) =>
                  setPriceRange((current) => ({
                    ...current,
                    min: event.target.value,
                  }))
                }
                placeholder={
                  minimumPrice
                    ? `Min ${minimumPrice.toLocaleString()}`
                    : "Min price"
                }
                aria-label="Minimum price"
                className="w-40 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-[#739f46] focus:ring-2 focus:ring-[#dce9c9]"
              />
              <input
                type="number"
                min="0"
                value={priceRange.max}
                onChange={(event) =>
                  setPriceRange((current) => ({
                    ...current,
                    max: event.target.value,
                  }))
                }
                placeholder={
                  maximumPrice
                    ? `Max ${maximumPrice.toLocaleString()}`
                    : "Max price"
                }
                aria-label="Maximum price"
                className="w-40 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-[#739f46] focus:ring-2 focus:ring-[#dce9c9]"
              />

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                title="Clear filters"
                aria-label="Clear filters"
                className="flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FilterX className="size-4" />
              </button>

              <div className="ml-auto flex items-center gap-3">
                <label className="flex items-center gap-2 whitespace-nowrap text-sm text-stone-600">
                  Sort by
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortOption)
                    }
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-stone-900 outline-none focus:border-[#739f46]"
                  >
                    <option value="newest">Newest arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </label>

                <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                    className={`flex size-8 items-center justify-center rounded-md transition ${
                      viewMode === "grid"
                        ? "bg-[#17351f] text-white"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                    className={`flex size-8 items-center justify-center rounded-md transition ${
                      viewMode === "list"
                        ? "bg-[#17351f] text-white"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[90rem] px-4 py-10 md:px-8 md:py-14">
          <div>
            <p className="mb-5 text-sm text-stone-500">
              {loading
                ? "Finding verified opportunities…"
                : `${filteredListings.length} ${filteredListings.length === 1 ? "opportunity" : "opportunities"} found`}
            </p>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  >
                    <div className="aspect-[4/3] bg-stone-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-1/3 rounded bg-stone-100" />
                      <div className="h-6 w-4/5 rounded bg-stone-200" />
                      <div className="h-4 rounded bg-stone-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-[#edf5e7]">
                  <Search className="size-9 text-[#5c8435]" />
                </div>
                <h3 className="mt-5 font-semibold text-2xl">
                  No matching opportunities
                </h3>
                <p className="mt-2 max-w-md text-stone-500">
                  Try adjusting your search or filters. Our advisory team can
                  also help you identify an off-market opportunity.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-lg bg-[#17351f] px-5 py-3 font-semibold text-white transition hover:bg-[#285333]"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group flex items-center gap-4 p-4 transition hover:bg-stone-50 sm:gap-5 sm:p-5"
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:size-24">
                      <img
                        src={listing.imageUrl || "/new_images/Union.png"}
                        alt={listing.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-stone-900 sm:text-lg">
                        {listing.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-stone-500 text-sm">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{listing.region}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                      <p className="hidden font-semibold text-stone-950 sm:block">
                        {listing.priceLabel}
                      </p>
                      <span className="inline-flex items-center gap-1 font-semibold text-sm text-[#5c8435] transition group-hover:text-[#456a27]">
                        View
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => (
                    <article
                      key={listing.id}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                        <img
                          src={listing.imageUrl || "/new_images/Union.png"}
                          alt={listing.name}
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 font-medium text-xs text-[#315422] shadow-sm">
                          <Sparkles className="size-3" /> Verified
                        </span>
                        <span className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-1 rounded-full bg-stone-950/80 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{listing.region}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(listing.id)}
                          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition hover:scale-105"
                          aria-label={
                            favorites.includes(listing.id)
                              ? "Remove from saved listings"
                              : "Save listing"
                          }
                        >
                          <Heart
                            className={`size-4 ${favorites.includes(listing.id) ? "fill-[#c2410c] text-[#c2410c]" : ""}`}
                          />
                        </button>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-semibold text-lg leading-snug text-stone-900">
                          {listing.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <p className="font-semibold text-lg text-stone-950">
                            {listing.priceLabel}
                          </p>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="inline-flex items-center gap-1 font-semibold text-sm text-[#5c8435] transition hover:text-[#456a27]"
                          >
                            View
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <BottomCTASection
        question="Looking for a specific opportunity?"
        buttonText="Speak with an advisor"
        backgroundImage="/new_images/7.jpg"
        link="https://forms.fillout.com/t/oEtePaNuxSus"
      />
      <Footer />
    </div>
  );
}
