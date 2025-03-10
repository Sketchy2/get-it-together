const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
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

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  }


};


module.exports = nextConfig;
