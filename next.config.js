/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['framerusercontent.com','cdn.shapo.io','lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig