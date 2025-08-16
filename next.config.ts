// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
    images: {
        domains: ['lh3.googleusercontent.com'], // libera esse domínio
        // ou, para permitir qualquer subdomínio lhX.googleusercontent.com:
        // remotePatterns: [
        //   {
        //     protocol: 'https',
        //     hostname: '**.googleusercontent.com',
        //     pathname: '/**',
        //   },
        // ],
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Fix for Supabase Realtime WebSocket factory critical dependency warning
        config.resolve.fallback = {
            ...config.resolve.fallback,
            ws: false,
            fs: false,
            net: false,
            tls: false,
            crypto: false,
        };

        // Ignore WebSocket dynamic require warnings in Supabase Realtime
        config.ignoreWarnings = [
            ...(config.ignoreWarnings || []),
            {
                module: /node_modules\/@supabase\/realtime-js/,
                message: /Critical dependency/,
            },
            {
                module: /node_modules\/@supabase\/realtime-js/,
                message: /the request of a dependency is an expression/,
            },
            {
                module: /node_modules\/@supabase\/realtime-js/,
                message: /A Node\.js API is used/,
            },
        ];

        // Optimize serialization for large strings
        config.optimization = {
            ...config.optimization,
            usedExports: true,
            sideEffects: false,
        };

        // Add externals for Node.js specific modules when building for client
        if (!isServer) {
            config.externals = config.externals || [];
            config.externals.push({
                'utf-8-validate': 'commonjs utf-8-validate',
                'bufferutil': 'commonjs bufferutil',
            });
        }

        return config;
    },
});
