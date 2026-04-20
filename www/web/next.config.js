const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: [
    "@hashfund/zeroboost",
    "@hashfund/sdk",
    "@hashfund/bn",
    "@hashfund/wallets",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
    };

    // Fix "exports is not defined" for CJS packages bundled for the browser
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    serverComponentsExternalPackages: [
      "bs58",
      "@coral-xyz/anchor",
      "@metaplex-foundation/umi",
      "@metaplex-foundation/umi-serializers-encodings",
      "@metaplex-foundation/umi-bundle-defaults",
    ],
    esmExternals: "loose",
  },
};

module.exports = nextConfig;