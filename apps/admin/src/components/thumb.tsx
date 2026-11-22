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
  style,
}: {
  src?: string;
  fallback?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Restart the fallback chain whenever a different image is shown.
  const [state, setState] = useState({ src, step: 0 });
  if (state.src !== src) setState({ src, step: 0 });
  const step = state.src === src ? state.step : 0;
  const setStep = (f: (n: number) => number) => setState((s) => ({ ...s, step: f(s.step) }));
  const url = step === 0 ? src : step === 1 ? fallback : undefined;
  if (!url)
    return (
      <span
        className={cn("grid place-items-center bg-muted text-muted-foreground", className)}
        style={style}
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
      style={style}
    />
  );
}
