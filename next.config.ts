import type { NextConfig } from "next";

// BUILD_TARGET=app -> static export bundled into the Capacitor app (no server code, no secrets).
const isApp = process.env.BUILD_TARGET === "app";

// Origins of the Capacitor WebView (Android: https://localhost, iOS: capacitor://localhost)
const APP_ORIGINS = ["https://localhost", "capacitor://localhost"];

const turbopack = {
  rules: {
    "*.css": {
      loaders: ["@tailwindcss/turbopack"],
      as: "*.css",
    },
  },
};

const nextConfig: NextConfig = isApp
  ? {
      output: "export",
      // Only .tsx pages are routes in the app build, so server API routes (route.ts) are excluded.
      pageExtensions: ["tsx"],
      images: { unoptimized: true },
      trailingSlash: true,
      turbopack,
    }
  : {
      cacheComponents: true,
      partialPrefetching: true,
      turbopack,
      async headers() {
        return APP_ORIGINS.map((origin) => ({
          source: "/api/restaurants",
          has: [{ type: "header" as const, key: "origin", value: origin.replace(/[.:/]/g, "\\$&") }],
          headers: [
            { key: "Access-Control-Allow-Origin", value: origin },
            { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
            { key: "Vary", value: "Origin" },
          ],
        }));
      },
    };

export default nextConfig;
