import type { NextConfig } from 'next';

const nextConfig: NextConfig & { agentRules?: boolean } = {
  agentRules: false,
  output: 'standalone',
  // Pin the workspace root so a stray package-lock.json in a parent directory
  // can't shift Turbopack's file tracing.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
