/**
 * Jira Proxy Server - Entry Point
 * 
 * This server acts as a proxy between the Dashboard and Jira API,
 * handling CORS restrictions and providing data aggregation.
 */

import express, { Application } from 'express';
import cors from 'cors';
import { loadConfig, ProxyConfig } from './config';
import { JiraClient } from './jira-client';
import { Cache } from './cache';
import { createJiraDataRouter } from './routes/jira-data';

/**
 * Validate Jira connectivity during startup
 */
async function validateJiraConnectivity(jiraClient: JiraClient): Promise<void> {
  console.log('[Server] Validating Jira connectivity...');
  
  try {
    const boards = await jiraClient.getAllBoards();
    console.log(`[Server] ✓ Successfully connected to Jira API (found ${boards.length} boards)`);
  } catch (error: any) {
    console.error('[Server] ✗ Failed to connect to Jira API:', error.message);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication failed: Invalid Jira credentials. Please check JIRA_EMAIL and JIRA_API_TOKEN.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot reach Jira API at ${error.config?.baseURL}. Please check JIRA_DOMAIN.`);
    } else {
      throw new Error(`Jira API validation failed: ${error.message}`);
    }
  }
}

/**
 * Initialize and configure Express application
 */
function createApp(config: ProxyConfig, jiraClient: JiraClient, cache: Cache): Application {
  const app = express();

  // Configure CORS middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }));

  // Configure JSON body parser
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.path}`, {
      origin: req.headers.origin,
      timestamp: new Date().toISOString(),
    });
    next();
  });

  // Register routes
  const jiraDataRouter = createJiraDataRouter(config, jiraClient, cache);
  app.use(jiraDataRouter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.environment,
    });
  });

  // 404 handler
  app.use((req, res) => {
    console.log(`[Server] 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: 'Not Found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  console.log('[Server] Starting Jira Proxy Server...');
  console.log('[Server] Environment:', process.env.NODE_ENV || 'development');

  let config: ProxyConfig;

  // Load and validate configuration
  try {
    config = loadConfig();
    console.log('[Server] ✓ Configuration loaded successfully');
    console.log(`[Server] - Port: ${config.port}`);
    console.log(`[Server] - Jira Domain: ${config.jiraDomain}`);
    console.log(`[Server] - Jira Email: ${config.jiraEmail}`);
    console.log(`[Server] - Cache TTL: ${config.cacheTTL}s`);
    console.log(`[Server] - Environment: ${config.environment}`);
  } catch (error: any) {
    console.error('[Server] ✗ Configuration error:', error.message);
    console.error('[Server] Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Initialize Jira client
  const jiraClient = new JiraClient(config);
  console.log('[Server] ✓ Jira client initialized');

  // Initialize cache
  const cache = new Cache();
  console.log('[Server] ✓ Cache initialized');

  // Validate Jira connectivity
  try {
    await validateJiraConnectivity(jiraClient);
  } catch (error: any) {
    console.error('[Server] ✗ Jira connectivity validation failed:', error.message);
    console.error('[Server] Server will not start. Please fix the configuration and try again.');
    process.exit(1);
  }

  // Create and configure Express app
  const app = createApp(config, jiraClient, cache);

  // Start listening
  const server = app.listen(config.port, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Jira Proxy Server is running!`);
    console.log(`  Port: ${config.port}`);
    console.log(`  URL: http://localhost:${config.port}`);
    console.log(`  Environment: ${config.environment}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  http://localhost:${config.port}/health`);
    console.log(`  GET  http://localhost:${config.port}/api/jira-data`);
    console.log(`  POST http://localhost:${config.port}/api/cache/invalidate`);
    console.log('');
  });

  // Graceful shutdown handler
  const shutdown = async (signal: string) => {
    console.log('');
    console.log(`[Server] ${signal} received, starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
      console.log('[Server] ✓ HTTP server closed');
      
      // Clear cache
      cache.clear();
      console.log('[Server] ✓ Cache cleared');
      
      console.log('[Server] ✓ Graceful shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Server] ✗ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Register shutdown handlers
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('[Server] ✗ Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] ✗ Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('[Server] ✗ Fatal error during startup:', error);
  process.exit(1);
});
