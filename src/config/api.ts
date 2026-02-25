/**
 * API Configuration for Dashboard
 * 
 * Automatically detects the environment and configures the proxy URL accordingly.
 * - Development: Uses localhost:3001 by default
 * - Production: MUST set VITE_PROXY_URL to Railway backend URL
 */

const getProxyUrl = (): string => {
  // If VITE_PROXY_URL is explicitly set, use it (Railway URL in production)
  if (import.meta.env.VITE_PROXY_URL) {
    return import.meta.env.VITE_PROXY_URL;
  }
  
  // Development: use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // Production fallback (should not reach here - VITE_PROXY_URL should be set)
  console.error('VITE_PROXY_URL is not set in production! Please configure it in Vercel.');
  return '';
};

export const API_CONFIG = {
  proxyUrl: getProxyUrl(),
} as const;
