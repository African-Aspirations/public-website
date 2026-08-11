"use client";

import axios from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { AlertModal } from "@/components/alert";
import { EditModal } from "@/components/edit";
import EmptyState from "@/components/empty-state";
import { Heading } from "@/components/heading";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal-store";

type Category = {
  id: string;
  label: string;
  desc?: string | null;
  products?: unknown[];
};

const CategoriesAdmin = () => {
  const { onOpen } = useModal();
  const [loading, setLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [getCatId, setGetCatId] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [descInput, setDescInput] = useState("");

  const getCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/categories/");
      setCategories(response.data ?? []);
    } catch (error: any) {
      console.error(error.response?.data ?? error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (category: Category) => {
    setGetCatId(category.id);
    setLabelInput(category.label ?? "");
    setDescInput(category.desc ?? "");
    setOpenEdit(true);
  };

  const editCategory = async (id: string) => {
    try {
      setEditLoading(true);
      await axios.patch(`/api/categories/${id}`, {
        label: labelInput,
        desc: descInput,
      });
      toast.success("Category updated successfully");
      setOpenEdit(false);
      await getCategories();
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      toast.error("Something went wrong!!");
    } finally {
      setEditLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setDelLoading(true);
      await axios.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully");
      setOpenDel(false);
      await getCategories();
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      toast.error("Something went wrong!!");
    } finally {
      setDelLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Category name"
        value={labelInput}
        onChange={(e) => setLabelInput(e.target.value)}
      />
      <Textarea
        className="border-0 bg-zinc-300/50 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Short description"
        value={descInput}
        onChange={(e) => setDescInput(e.target.value)}
      />
    </div>
  );

  return (
    <div className="p-8">
      <Toaster position="top-center" />
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <Heading
          title={`Categories (${categories.length})`}
          description="Manage the business types listings can be tagged with"
        />
        <Button onClick={() => onOpen("createCategory", { onSuccess: getCategories })}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>
      <Separator className="mt-4" />

      {loading ? (
        <div className="flex w-full items-center justify-center p-10">
          <Loader />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex w-full items-center justify-center p-10">
          <EmptyState title="No categories yet" subtitle="Add a category to start tagging listings." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-900">
                  {category.label}
                </p>
                <p className="mt-1 line-clamp-2 text-stone-500 text-sm">
                  {category.desc || "No description"}
                </p>
                <p className="mt-2 text-stone-400 text-xs">
                  {category.products?.length ?? 0} listing
                  {(category.products?.length ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                  onClick={() => openEditModal(category)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-400"
                  onClick={() => {
                    setGetCatId(category.id);
                    setOpenDel(true);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertModal
        isOpen={openDel}
        onClose={() => setOpenDel(false)}
        loading={delLoading}
        onConfirm={() => deleteCategory(getCatId)}
      />
      <EditModal
        title="Edit Category"
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        loading={editLoading}
        body={bodyContent}
        onConfirm={() => editCategory(getCatId)}
      />
    </div>
  );
};

export default CategoriesAdmin;
