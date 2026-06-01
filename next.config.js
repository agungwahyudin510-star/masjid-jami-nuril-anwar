const withPWA = require("@ducanh2912/next-pwa").default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

module.exports = withPWA({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
})(nextConfig);