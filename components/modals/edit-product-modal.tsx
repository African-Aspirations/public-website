"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal-store";
import ImageUpload from "../image-upload";

export const EditProductModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [DescInput, setDescInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("USD");
  const [locationInput, setLocationInput] = useState("");
  const [sdeInput, setSdeInput] = useState("");
  const [downPaymentInput, setDownPaymentInput] = useState("");
  const [getId, setGetId] = useState("");

  const handleNameInputChange = (e: any) => {
    setNameInput(e.target.value);
  };

  const handleDescInputChange = (e: any) => {
    setDescInput(e.target.value);
  };

  const handleLinkInputChange = (e: any) => {
    setLinkInput(e.target.value);
  };

  const handCategoryInputChange = (value: any) => {
    setCategoryInput(value);
  };

  const isModalOpen = isOpen && type === "editProduct";

  const router = useRouter();

  // edit a product
  const submit = async (id: any) => {
    try {
      setLoading(true);

      const _response = await axios.patch(
        `/api/products/${id}`,
        {
          name: nameInput,
          desc: DescInput,
          link: linkInput,
          imageUrl: file,
          category: categoryInput,
          price: priceInput ? Number(priceInput) : null,
          currency: currencyInput,
          location: locationInput,
          sde: sdeInput ? Number(sdeInput) : null,
          downPayment: downPaymentInput ? Number(downPaymentInput) : null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Product updated successfully!!");
      handleClose();
      data?.onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      toast.error(
        typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong!!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // get all categories
  const getCategories = async () => {
    try {
      const response = await axios.get("/api/categories/", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setCategories(response.data);
    } catch (error: any) {
      console.error(error.response?.data ?? error);
    }
  };

  useEffect(() => {
    if (!isModalOpen || !data?.product) return;

    getCategories();

    const product = data.product;
    setGetId(product.id);
    setNameInput(product.name ?? "");
    setDescInput(product.desc ?? "");
    setLinkInput(product.link ?? "");
    setCategoryInput(product.category?.id ?? "");
    setFile(product.imageUrl ?? "");
    setPriceInput(product.price != null ? String(product.price) : "");
    setCurrencyInput(product.currency ?? "USD");
    setLocationInput(product.location ?? "");
    setSdeInput(product.sde != null ? String(product.sde) : "");
    setDownPaymentInput(
      product.downPayment != null ? String(product.downPayment) : "",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, data?.product]);

  return (
    <>
      <Toaster position="top-center" />
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white p-0 text-black">
          <DialogHeader className="px-6 pt-8">
            <DialogTitle className="text-center font-bold text-2xl">
              Edit Listing
            </DialogTitle>
          </DialogHeader>
          <form action="" className="m-4">
            <ImageUpload setFile={setFile} file={file} />
            <Select
              onValueChange={(value) => {
                handCategoryInputChange(value);
              }}
              value={categoryInput}
            >
              <SelectTrigger className="mb-3 border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category: any) => (
                  <React.Fragment key={category.id}>
                    <SelectItem value={category.id}>
                      {category?.label}
                    </SelectItem>
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            <Input
              className="mb-3 border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Business name"
              value={nameInput}
              onChange={handleNameInputChange}
            />

            <Input
              className="mb-3 border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Source link (optional)"
              value={linkInput}
              onChange={handleLinkInputChange}
            />
            <Textarea
              className="mb-3 border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Description"
              value={DescInput}
              onChange={handleDescInputChange}
            />

            <Input
              className="mb-3 border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />

            <div className="mb-3 grid grid-cols-2 gap-3">
              <Input
                type="number"
                className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Asking price"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />
              <Input
                className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Currency (e.g. USD)"
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value)}
              />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <Input
                type="number"
                className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Down payment"
                value={downPaymentInput}
                onChange={(e) => setDownPaymentInput(e.target.value)}
              />
              <Input
                type="number"
                className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Seller's discretionary earnings"
                value={sdeInput}
                onChange={(e) => setSdeInput(e.target.value)}
              />
            </div>
          </form>

          <DialogFooter className="bg-gray-100 px-6 py-4">
            <Button onClick={() => submit(getId)}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
