import type { NextConfig } from "next";

/**
 * Private admin. Never indexed, never framed, never linked from the public site.
 */
const config: NextConfig = {
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@aa/db", "@aa/ui", "@aa/emails"],
  poweredByHeader: false,
  // Keep the dev badge away from the sidebar footer (user menu).
  devIndicators: { position: "bottom-right" },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default config;
