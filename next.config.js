/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // <--- ¡COMENTA O ELIMINA ESTA LÍNEA!

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