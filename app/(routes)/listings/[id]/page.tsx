"use client";

import axios from "axios";
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";

type ListingDetail = {
  id: string;
  name: string;
  desc: string;
  imageUrl?: string | null;
  link?: string | null;
  price?: number | null;
  currency?: string | null;
  location?: string | null;
  sde?: number | null;
  downPayment?: number | null;
  category?: { label?: string | null } | null;
};

function formatMoney(value: number | null | undefined, currency = "USD") {
  if (value == null) return "Undisclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        if (active) setListing(response.data);
      } catch (_error) {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  const reference = id ? id.slice(0, 8).toUpperCase() : "";

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-stone-950">
      <ClientNavbar />
      <main className="pt-24 md:pt-20">
        {loading ? (
          <div className="mx-auto max-w-[90rem] px-4 py-20 md:px-8">
            <div className="h-6 w-64 animate-pulse rounded bg-stone-200" />
            <div className="mt-6 h-10 w-96 animate-pulse rounded bg-stone-200" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <div className="aspect-[16/10] animate-pulse rounded-2xl bg-stone-200" />
              <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />
            </div>
          </div>
        ) : notFound || !listing ? (
          <div className="mx-auto flex max-w-[90rem] flex-col items-center px-4 py-24 text-center md:px-8">
            <h1 className="font-semibold text-3xl">Listing not found</h1>
            <p className="mt-3 text-stone-500">
              This opportunity may have been sold or removed.
            </p>
            <Link
              href="/listings"
              className="mt-6 rounded-lg bg-[#17351f] px-5 py-3 font-semibold text-white transition hover:bg-[#285333]"
            >
              Back to all listings
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-[90rem] px-4 pt-8 md:px-8">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-stone-500 text-xs"
              >
                <Link href="/listings" className="hover:text-stone-900">
                  All listings
                </Link>
                {listing.category?.label && (
                  <>
                    <ChevronRight size={12} />
                    <span>{listing.category.label}</span>
                  </>
                )}
                <ChevronRight size={12} />
                <span className="font-medium text-stone-900">
                  {listing.name}
                </span>
              </nav>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="max-w-3xl font-semibold text-3xl tracking-tight sm:text-4xl">
                    {listing.name}
                  </h1>
                  {listing.location && (
                    <p className="mt-2 flex items-center gap-1.5 text-stone-500">
                      <MapPin className="size-4 text-[#5c8435]" />
                      {listing.location}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-2xl text-[#17351f]">
                  {formatMoney(listing.price, listing.currency || "USD")}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-[90rem] gap-8 px-4 pb-20 md:px-8 lg:grid-cols-[1.6fr_1fr]">
              <div>
                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-stone-200">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-stone-400 text-sm">
                      No image available
                    </div>
                  )}
                </div>

                <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <h2 className="font-semibold text-xl">About this listing</h2>
                  <p className="mt-3 whitespace-pre-line text-stone-600 leading-relaxed">
                    {listing.desc}
                  </p>
                </section>

                <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <h2 className="mb-5 font-semibold text-xl">Details</h2>
                  <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                    <div>
                      <dt className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                        Type
                      </dt>
                      <dd className="mt-1 font-medium text-stone-900">
                        {listing.category?.label || "Business"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                        Location
                      </dt>
                      <dd className="mt-1 font-medium text-stone-900">
                        {listing.location || "Ghana"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                        Price
                      </dt>
                      <dd className="mt-1 font-medium text-stone-900">
                        {formatMoney(listing.price, listing.currency || "USD")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                        Down payment
                      </dt>
                      <dd className="mt-1 font-medium text-stone-900">
                        {formatMoney(
                          listing.downPayment,
                          listing.currency || "USD",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                        Seller's discretionary earnings
                      </dt>
                      <dd className="mt-1 font-medium text-stone-900">
                        {formatMoney(listing.sde, listing.currency || "USD")}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <p className="font-medium text-stone-400 text-xs uppercase tracking-[0.12em]">
                    Asking price
                  </p>
                  <p className="mt-1 font-semibold text-3xl text-[#17351f]">
                    {formatMoney(listing.price, listing.currency || "USD")}
                  </p>

                  <div className="mt-6 border-stone-100 border-t pt-6">
                    <h3 className="font-semibold text-lg">
                      Interested in this listing?
                    </h3>
                    <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                      Get in touch with our team to learn more or schedule a
                      consultation.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <a
                        href="mailto:connect@africanaspirations.com"
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#17351f] px-5 py-3 font-semibold text-sm text-white transition hover:bg-[#285333]"
                      >
                        <Mail className="size-4" /> Email us
                      </a>
                      <a
                        href="tel:+233303982318"
                        className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-5 py-3 font-semibold text-sm text-stone-900 transition hover:bg-stone-50"
                      >
                        <Phone className="size-4" /> Call us
                      </a>
                    </div>
                  </div>

                  <p className="mt-6 text-stone-400 text-xs">
                    Reference: {reference}
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
