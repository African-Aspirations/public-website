"use client";

import axios from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { AlertModal } from "@/components/alert";
import EmptyState from "@/components/empty-state";
import { Heading } from "@/components/heading";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/use-modal-store";

type Listing = {
  id: string;
  name: string;
  desc: string;
  imageUrl: string;
  location?: string | null;
  price?: number | null;
  currency?: string | null;
  sde?: number | null;
  downPayment?: number | null;
  category?: { id?: string; label?: string | null } | null;
};

function formatMoney(value: number | null | undefined, currency = "USD") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const ListingsAdmin = () => {
  const { onOpen } = useModal();
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [getProdId, setGetProdId] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);

  const getListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products/");
      setListings(response.data ?? []);
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      toast.error("Something went wrong!!");
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      setDelLoading(true);
      await axios.delete(`/api/products/${id}`);
      toast.success("Listing deleted successfully");
      setOpenDel(false);
      await getListings();
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      toast.error("Something went wrong!!");
    } finally {
      setDelLoading(false);
    }
  };

  useEffect(() => {
    getListings();
  }, []);

  return (
    <div className="p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <Heading
          title={`Listings (${listings.length})`}
          description="Create and manage every business listing shown on the site"
        />
        <Button onClick={() => onOpen("createProduct", { onSuccess: getListings })}>
          <Plus className="mr-2 h-4 w-4" /> Add Listing
        </Button>
      </div>
      <Separator className="mt-4" />

      {loading ? (
        <div className="flex w-full items-center justify-center p-10">
          <Loader />
        </div>
      ) : listings.length === 0 ? (
        <div className="flex w-full items-center justify-center p-10">
          <EmptyState title="No listings yet" subtitle="Add your first business listing." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-stone-400 text-xs uppercase tracking-[0.08em]">
                <th className="px-6 py-3 font-medium">Listing</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Asking price</th>
                <th className="px-6 py-3 font-medium">SDE</th>
                <th className="px-6 py-3 font-medium">Down payment</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-stone-100 border-t">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {listing.imageUrl ? (
                          <Image
                            fill
                            className="object-cover"
                            src={listing.imageUrl}
                            alt={listing.name}
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-stone-900">
                          {listing.name}
                        </p>
                        <p className="max-w-xs truncate text-stone-400 text-xs">
                          {listing.desc}
                        </p>
                      </div>
                    </div>
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
                  <td className="px-6 py-4 text-stone-600">
                    {formatMoney(listing.sde, listing.currency || "USD")}
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {formatMoney(listing.downPayment, listing.currency || "USD")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                        onClick={() =>
                          onOpen("editProduct", {
                            product: listing,
                            onSuccess: getListings,
                          })
                        }
                      >
                        <Pencil size={14} className="mr-1.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-400"
                        onClick={() => {
                          setOpenDel(true);
                          setGetProdId(listing.id);
                        }}
                      >
                        <Trash2 size={14} className="mr-1.5" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertModal
        isOpen={openDel}
        onClose={() => setOpenDel(false)}
        loading={delLoading}
        onConfirm={() => deleteListing(getProdId)}
      />
    </div>
  );
};

export default ListingsAdmin;
