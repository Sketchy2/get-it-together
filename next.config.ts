import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Externalize Azure and OCI packages for client-side builds
      config.externals = {
        '@azure/app-configuration': '@azure/app-configuration',
        '@azure/identity': '@azure/identity',
        '@azure/keyvault-secrets': '@azure/keyvault-secrets',
        'oci-common': 'oci-common',
        'oci-objectstorage': 'oci-objectstorage',
        'oci-secrets': 'oci-secrets',
        ...config.externals, // Keep existing externals
      };
    }
    return config;
  },
};

export default nextConfig;
