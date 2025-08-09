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
});
