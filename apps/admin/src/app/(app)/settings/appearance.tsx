"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useState, useTransition } from "react";
import { setTheme } from "@/lib/actions";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** Light / Dark / System. Applied instantly, saved in a cookie for the next visit. */
export function Appearance({ initial }: { initial: Theme }) {
  const [theme, set] = useState(initial);
  const [, start] = useTransition();
  function choose(t: Theme) {
    set(t);
    const dark =
      t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    start(() => setTheme(t));
  }
  return (
    <fieldset className="grid max-w-md grid-cols-3 gap-3">
      <legend className="sr-only">Theme</legend>
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <label
          key={id}
          className={cn(
            "grid cursor-pointer place-items-center gap-2 rounded-lg border bg-background p-4 text-sm hover:border-ring has-focus-visible:outline-2 has-focus-visible:outline-ring",
            theme === id && "border-primary ring-1 ring-primary",
          )}
        >
          <input
            type="radio"
            name="theme"
            value={id}
            checked={theme === id}
            onChange={() => choose(id)}
            className="sr-only"
          />
          <Icon className="size-5" aria-hidden />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
