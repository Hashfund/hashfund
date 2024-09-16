/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    turbo: {},
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
