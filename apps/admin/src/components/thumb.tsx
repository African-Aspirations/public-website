"use client";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image with a fallback source, then a placeholder if both fail. */
export function Thumb({
  src,
  fallback,
  alt,
  className,
}: {
  src?: string;
  fallback?: string;
  alt: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const url = step === 0 ? src : step === 1 ? fallback : undefined;
  if (!url)
    return (
      <span
        className={cn("grid place-items-center bg-muted text-muted-foreground", className)}
        title={alt}
      >
        <ImageOff className="size-4" aria-hidden />
      </span>
    );
  return (
    // biome-ignore lint/performance/noImgElement: remote thumbnails, sized by CSS
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setStep((n) => n + 1)}
      className={cn("object-cover", className)}
    />
  );
}
