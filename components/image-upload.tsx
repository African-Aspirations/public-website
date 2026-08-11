"use client";

import axios from "axios";
import { ImagePlus, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  setFile: (url: string) => void;
  file?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ setFile, file }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    const formData = new FormData();
    formData.append("file", selected);

    try {
      setUploading(true);
      const response = await axios.post("/api/upload", formData);
      setFile(response.data.url);
    } catch (error: any) {
      const message =
        typeof error.response?.data === "string"
          ? error.response.data
          : "Failed to upload image.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {file ? (
          <div className="relative h-[200px] w-[200px] overflow-hidden rounded-md">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => setFile("")}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <Image
              fill
              className="object-cover"
              alt="Listing image"
              src={file}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            />
          </div>
        ) : null}
      </div>
      <Button
        type="button"
        disabled={uploading}
        onClick={handleUploadButtonClick}
        className="mb-4 bg-black text-white"
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Uploading…" : "Upload an Image"}
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileSelected}
      />
    </div>
  );
};

export default ImageUpload;
