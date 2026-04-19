/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@legalmeet/ui', '@legalmeet/db', '@legalmeet/services'],
};
module.exports = nextConfig;
