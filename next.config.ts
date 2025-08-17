// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
    // Vercel optimization
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: false,
    
    // Enhanced image optimization for Vercel
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.googleusercontent.com',
                pathname: '/**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    
    // Improved experimental features for Vercel
    experimental: {
        optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
        webVitalsAttribution: ['CLS', 'LCP'],
    },

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Vercel-optimized webpack config
        if (!dev && !isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                '@/components/ui': require('path').resolve(__dirname, 'src/components/ui'),
            };
        }

        // Essential fallbacks only for Edge Runtime compatibility
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };

        // Minimal warning suppressions for Vercel
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
