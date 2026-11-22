import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isTheme, THEME_COOKIE } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AA Admin", template: "%s | AA Admin" },
  robots: { index: false, follow: false },
};

// "system": follow the OS before first paint (no flash of the wrong theme).
const SYSTEM_THEME = `if(matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = isTheme(saved) ? saved : "system";
  return (
    <html lang="en" className={theme === "dark" ? "dark" : undefined} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: constant inline script, no user input */}
        {theme === "system" && <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME }} />}
      </head>
      <body className="min-h-dvh font-sans text-foreground antialiased">
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
