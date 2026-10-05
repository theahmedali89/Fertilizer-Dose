import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the next-intl request configuration (see src/i18n/request.ts).
// NOTE: We deliberately do NOT use `next-intl/plugin` here. That plugin
// top-level-requires `@swc/core` (for its message-extractor, which we don't
// use), and the nested `@swc/core@1.16` native binding refuses to load in
// this container (broken SWC_NATIVE_BINDING_CACHE validation when running
// as root). All the plugin does for a standard setup is alias
// `next-intl/config` to the request config file, which we do directly below
// for both webpack and Turbopack. This is equivalent and has zero native deps.
const REQUEST_CONFIG = "./src/i18n/request.ts";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

/**
 * Minimal replacement for `createNextIntlPlugin(REQUEST_CONFIG)`:
 * aliases `next-intl/config` so `next-intl/server` can load getRequestConfig.
 */
function withRequestConfigAlias(config) {
  const userWebpack = config.webpack;
  return {
    ...config,
    turbopack: {
      ...(config.turbopack ?? {}),
      resolveAlias: {
        ...config.turbopack?.resolveAlias,
        // Turbopack aliases don't support absolute paths — keep relative.
        "next-intl/config": REQUEST_CONFIG,
      },
    },
    webpack: (webpackConfig, context) => {
      webpackConfig.resolve ??= {};
      webpackConfig.resolve.alias ??= {};
      // Webpack requires an absolute path for aliases.
      webpackConfig.resolve.alias["next-intl/config"] = path.resolve(
        webpackConfig.context ?? __dirname,
        REQUEST_CONFIG
      );
      return typeof userWebpack === "function"
        ? userWebpack(webpackConfig, context)
        : webpackConfig;
    },
  };
}

export default withRequestConfigAlias(nextConfig);
