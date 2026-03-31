import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    };
    return config;
  },
  // 301 Redirects for SEO migration from the old yes.edu.co site
  async redirects() {
    return [
      {
        source: '/contactenos',
        destination: '/contacto',
        permanent: true,
      },
      {
        source: '/nosotros',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ingles',
        destination: '/cursos#ingles',
        permanent: true,
      },
      {
        source: '/frances',
        destination: '/cursos#frances',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
