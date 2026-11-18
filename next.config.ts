import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',

    reactStrictMode: false,
    productionBrowserSourceMaps: false,

    eslint: {
        ignoreDuringBuilds: true
    },

    typescript: {
        ignoreBuildErrors: true
    },

    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'react-icons',
            'date-fns',
            'recharts',
            'chart.js',
            '@radix-ui/react-icons',
            'framer-motion'
        ],
        serverActions: {
            bodySizeLimit: '500mb'
        }
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dcampusstrg.blob.core.windows.net',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'vapsclg.blob.core.windows.net',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: '*.blob.core.windows.net',
                pathname: '/**'
            }
        ]
    },

    async rewrites() {
        return [
            {
                source: '/api/admission/:path*',
                destination: 'https://ivrm-dev-admission-api.azurewebsites.net/api/:path*'
            }
        ];
    }
};

export default nextConfig;
