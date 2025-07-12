/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... tus otras configuraciones existentes (images, devIndicators, etc.)

  webpack: (config, { isServer }) => {
    // Ignorar la advertencia de Critical dependency para opentelemetry, require-in-the-middle y handlebars
    config.ignoreWarnings = [
      { module: /@opentelemetry\/instrumentation/ },
      { module: /require-in-the-middle/ },
      { module: /handlebars/ },
    ];

    // Si necesitas que ciertas dependencias no se empaqueten en el lado del servidor (SSR)
    // y se asuman como disponibles en el entorno de Node.js (como en Vercel Functions)
    if (isServer) {
      config.externals = config.externals || {};
      Object.assign(config.externals, {
        '@opentelemetry/sdk-node': '@opentelemetry/sdk-node',
        '@opentelemetry/instrumentation': '@opentelemetry/instrumentation',
        'genkit': 'genkit',
        // Puedes añadir aquí otras dependencias de Node.js que solo se usen en el servidor
        // y que no deban ser empaquetadas en el bundle del cliente.
      });
    }

    return config;
  },
};

module.exports = nextConfig;
