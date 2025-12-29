/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'maas-log-prod.cn-wlcb.ufileos.com' },
    ],
  },
}

module.exports = nextConfig
