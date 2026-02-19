/**
 * API Configuration for Dashboard
 * 
 * Automatically detects the environment and configures the proxy URL accordingly.
 * - Development: Uses localhost:3001 by default
 * - Production (Vercel): Uses relative path /api (Vercel handles routing)
 * - Can be overridden with VITE_PROXY_URL environment variable
 */

export const API_CONFIG = {
  proxyUrl: import.meta.env.VITE_PROXY_URL || 
            (import.meta.env.DEV 
              ? 'http://localhost:3001' 
              : ''),  // Empty string in production = relative path
} as const;
