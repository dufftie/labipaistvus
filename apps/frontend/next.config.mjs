import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@ant-design', 'antd'],
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    sassOptions: {
        includePaths: ['./src'],
        prependData: `@use "sass:math";`,
    },
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
})

export default withMDX(nextConfig);
