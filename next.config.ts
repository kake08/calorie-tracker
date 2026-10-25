import type { NextConfig } from "next";

// Every page shows the signed-in person's own data, so pages render per request
// instead of using Cache Components / partial prerendering.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
