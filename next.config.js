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
            }
        ]
    },
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client']
    },
    typescript: {
        ignoreBuildErrors: false
    },
    eslint: {
        ignoreDuringBuilds: false
    },
    swcMinify: true
}

// Export the config with a port override
module.exports = () => {
    const PORT = parseInt(process.env.PORT, 10) || 3002;
    process.env.PORT = PORT.toString();
    return nextConfig;
}
