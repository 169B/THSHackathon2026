/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required so that pdf-parse (and other Node.js-only packages) are not
  // bundled by webpack for server-side routes and cause build errors.
  serverExternalPackages: ["pdf-parse", "mammoth"],
  webpack: (config) => {
    // Prevent canvas/jsdom from being bundled (pdf-parse peer deps)
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
