/** @type {import('next').NextConfig} */
const nextConfig = {
  // System Architect is deployed to Netlify via @netlify/plugin-nextjs.
  // The plugin handles route adaptation, middleware, image optimization, and
  // ISR for us — no special config needed here.
  reactStrictMode: true,

  // Lock down runtime config so misconfiguration on the deploy host fails loudly.
  experimental: {
    typedRoutes: false  // off until we add a few real routes in Phase 2
  }
};

export default nextConfig;
