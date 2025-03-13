import type { NextConfig } from "next";
const webpack = require('webpack');

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
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^react-native-sqlite-storage$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@sap\/hana-client\/extension\/Stream$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mysql$/,
      })
    );

    // Optionally ignore specific warnings from TypeORM
    config.ignoreWarnings = [
      {
        // Ignore warnings in ConnectionOptionsReader
        module: /typeorm\/connection\/ConnectionOptionsReader\.js/,
      },
      {
        // Ignore warnings in DirectoryExportedClassesLoader
        module: /typeorm\/util\/DirectoryExportedClassesLoader\.js/,
      },
    ];

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
