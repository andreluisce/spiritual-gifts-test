import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

// Apenas 1 argumento: o caminho do request config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* suas configs */
};

export default withNextIntl(nextConfig);
