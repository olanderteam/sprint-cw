import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration interface for the Jira proxy server
 */
export interface ProxyConfig {
  port: number;
  jiraDomain: string;
  jiraEmail: string;
  jiraApiToken: string;
  cacheTTL: number; // in seconds
  environment: 'development' | 'production';
  projectKeys?: string[]; // Optional: filter boards by project keys
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Jira domain format (should be like: domain.atlassian.net)
 */
function isValidDomain(domain: string): boolean {
  // Domain should not be empty and should not include protocol
  if (!domain || domain.trim().length === 0) {
    return false;
  }
  
  // Check if domain contains protocol (http:// or https://)
  if (domain.includes('://')) {
    return false;
  }
  
  return true;
}

/**
 * Loads and validates configuration from environment variables
 * @throws Error if required environment variables are missing or invalid
 */
export function loadConfig(): ProxyConfig {
  // Check for required environment variables
  const requiredVars = {
    JIRA_DOMAIN: process.env.JIRA_DOMAIN,
    JIRA_EMAIL: process.env.JIRA_EMAIL,
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
  };

  // Validate that all required variables are present
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.trim().length === 0) {
      throw new Error(
        `Configuration error: ${key} is required. Please set it in your .env file.`
      );
    }
  }

  const jiraDomain = requiredVars.JIRA_DOMAIN!;
  const jiraEmail = requiredVars.JIRA_EMAIL!;
  const jiraApiToken = requiredVars.JIRA_API_TOKEN!;

  // Validate email format
  if (!isValidEmail(jiraEmail)) {
    throw new Error(
      `Configuration error: JIRA_EMAIL has invalid format. Expected format: user@example.com`
    );
  }

  // Validate domain format
  if (!isValidDomain(jiraDomain)) {
    throw new Error(
      `Configuration error: JIRA_DOMAIN has invalid format. Expected format: your-domain.atlassian.net (without http:// or https://)`
    );
  }

  // Validate API token is not empty
  if (jiraApiToken.trim().length === 0) {
    throw new Error(
      `Configuration error: JIRA_API_TOKEN cannot be empty.`
    );
  }

  // Parse optional configuration with defaults
  const port = parseInt(process.env.PORT || '3001', 10);
  const cacheTTL = parseInt(process.env.CACHE_TTL || '120', 10);
  const environment = (process.env.NODE_ENV === 'production' 
    ? 'production' 
    : 'development') as 'development' | 'production';

  // Parse project keys filter (comma-separated list)
  const projectKeys = process.env.JIRA_PROJECT_KEYS
    ? process.env.JIRA_PROJECT_KEYS.split(',').map(k => k.trim()).filter(k => k.length > 0)
    : undefined;

  if (projectKeys && projectKeys.length > 0) {
    console.log(`[Config] Filtering boards by project keys: ${projectKeys.join(', ')}`);
  }

  return {
    port,
    jiraDomain,
    jiraEmail,
    jiraApiToken,
    cacheTTL,
    environment,
    projectKeys,
  };
}
