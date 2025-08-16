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
        };

        // Ignore WebSocket dynamic require warnings in Supabase Realtime
        config.ignoreWarnings = [
            ...(config.ignoreWarnings || []),
            {
                module: /node_modules\/@supabase\/realtime-js/,
                message: /Critical dependency/,
            },
        ];

        return config;
    },
});
