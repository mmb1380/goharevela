/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'goharevela.ir',
      },
      {
        protocol: 'https',
        hostname: 'www.goharevela.ir',
      },
    ],
  },
}

module.exports = nextConfig
