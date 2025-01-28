/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // PIXI.js config
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ignore PIXI.js Worker errors during SSR
    if (isServer) {
      config.module.rules.push({
        test: /\.(mjs|js|ts|tsx)$/,
        exclude: /node_modules(?!\/\@pixi)/,
        loader: 'string-replace-loader',
        options: {
          search: 'new Worker',
          replace: '// new Worker',
        },
      });
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'collection.mooar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: [
      'collection.mooar.com',
      'pbs.twimg.com',
      'i.seadn.io',
      'openseauserdata.com',
      'nftstorage.link',
      'arweave.net',
      'creator-hub-prod.s3.us-east-2.amazonaws.com'
    ]
  },
  // Optimize output
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;  