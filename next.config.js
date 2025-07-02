/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com'
            },
            {
                protocol: 'https',
                hostname: 'codehelp-portfolio-website.netlify.app'
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com'
            },
            {
                protocol: 'https',
                hostname: 'oaidalleapiprodscus.blob.core.windows.net'
            },
            {
                protocol: 'https',
                hostname: '*.openai.com'
            }
        ],
        dangerouslyAllowSVG: true
    },
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client']
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    swcMinify: true,
    output: 'standalone',
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack']
        });
        return config;
    }
}

module.exports = nextConfig;
