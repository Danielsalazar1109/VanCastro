/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
  },
  images: {
    domains: ['framerusercontent.com','cdn.shapo.io','lh3.googleusercontent.com','media.istockphoto.com','www.valleydrivingschool.com','www.drivesmartbc.ca','media2.giphy.com'],
  },
}

module.exports = nextConfig