/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // <-- ESTA ES LA CLAVE

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://*.cloudworkstations.dev',
    ],
  },
};

module.exports = nextConfig;
