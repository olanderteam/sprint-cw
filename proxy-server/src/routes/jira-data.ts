/**
 * Jira data routes
 * Implements endpoints for fetching Jira data and cache management
 */

import { Router, Request, Response } from 'express';
import { JiraClient } from '../jira-client';
import { Cache } from '../cache';
import { fetchAllBoardsData, aggregateSquadsData } from '../data-aggregator';
import { ProxyConfig } from '../config';

/**
 * Error response format
 */
interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Create error response object
 */
function createErrorResponse(statusCode: number, message: string): ErrorResponse {
  return {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create and configure the jira-data router
 */
export function createJiraDataRouter(config: ProxyConfig, jiraClient: JiraClient, cache: Cache): Router {
  const router = Router();

  /**
   * OPTIONS /api/jira-data - CORS preflight handler
   */
  router.options('/api/jira-data', (req: Request, res: Response) => {
    console.log('[JiraDataRoute] OPTIONS /api/jira-data - CORS preflight request');
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
  });

  /**
   * GET /api/jira-data - Fetch aggregated Jira data
   */
  router.get('/api/jira-data', async (req: Request, res: Response) => {
    const startTime = Date.now();
    console.log('[JiraDataRoute] GET /api/jira-data - Request received', {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
    });

    // Set a timeout for the entire request (60 seconds)
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error('[JiraDataRoute] Request timeout after 60s');
        res.header('Access-Control-Allow-Origin', '*');
        res.status(504).json(
          createErrorResponse(504, 'Request timed out - Jira API is taking too long to respond')
        );
      }
    }, 60000);

    try {
      // Check cache first
      const cacheKey = 'dashboard-data';
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        console.log(`[JiraDataRoute] Cache hit - returning cached data (${duration}ms)`);
        
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Content-Type', 'application/json');
        res.status(200).json(cachedData);
        return;
      }

      console.log('[JiraDataRoute] Cache miss - fetching fresh data from Jira API');

      // Fetch all boards data
      const boardConfigs = await fetchAllBoardsData(jiraClient, cache, config.projectKeys);
      
      if (boardConfigs.length === 0) {
        clearTimeout(timeoutId);
        console.error('[JiraDataRoute] No boards found');
        res.header('Access-Control-Allow-Origin', '*');
        res.status(503).json(
          createErrorResponse(503, 'No boards found in Jira')
        );
        return;
      }

      // Aggregate and transform data
      const dashboardData = await aggregateSquadsData(jiraClient, boardConfigs, cache);

      // Cache the result
      cache.set(cacheKey, dashboardData, config.cacheTTL);

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log(`[JiraDataRoute] Successfully fetched and aggregated data (${duration}ms)`, {
        squads: dashboardData.squads.length,
        tasks: dashboardData.tasks.length,
        alerts: dashboardData.alerts.length,
      });

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Content-Type', 'application/json');
      res.status(200).json(dashboardData);
    } catch (error: any) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.error(`[JiraDataRoute] Error fetching Jira data (${duration}ms):`, {
        message: error.message,
        status: error.response?.status,
        stack: config.environment === 'development' ? error.stack : undefined,
      });

      res.header('Access-Control-Allow-Origin', '*');

      // Handle specific error types
      if (error.response?.status === 401) {
        res.status(401).json(
          createErrorResponse(401, 'Authentication failed: Invalid Jira credentials')
        );
      } else if (error.response?.status === 403) {
        res.status(401).json(
          createErrorResponse(401, 'Authentication failed: Access denied')
        );
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        res.status(504).json(
          createErrorResponse(504, 'Request to Jira API timed out after 30s')
        );
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        res.status(503).json(
          createErrorResponse(503, 'Jira API is currently unavailable')
        );
      } else if (error.response?.status === 429) {
        res.status(429).json(
          createErrorResponse(429, 'Rate limit exceeded, please try again later')
        );
      } else if (error.response?.status >= 500) {
        res.status(503).json(
          createErrorResponse(503, 'Jira API is currently unavailable')
        );
      } else {
        // Generic error - don't expose internal details
        res.status(500).json(
          createErrorResponse(500, 'An unexpected error occurred')
        );
      }
    }
  });

  /**
   * POST /api/cache/invalidate - Invalidate cache
   */
  router.post('/api/cache/invalidate', (req: Request, res: Response) => {
    console.log('[JiraDataRoute] POST /api/cache/invalidate - Cache invalidation requested');

    try {
      // Invalidate all dashboard-related cache entries
      cache.invalidate('dashboard-data');
      cache.invalidate('all-boards-config');

      console.log('[JiraDataRoute] Cache invalidated successfully');

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: 'Cache invalidated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[JiraDataRoute] Error invalidating cache:', error);

      res.header('Access-Control-Allow-Origin', '*');
      res.status(500).json(
        createErrorResponse(500, 'Failed to invalidate cache')
      );
    }
  });

  /**
   * OPTIONS /api/cache/invalidate - CORS preflight handler
   */
  router.options('/api/cache/invalidate', (req: Request, res: Response) => {
    console.log('[JiraDataRoute] OPTIONS /api/cache/invalidate - CORS preflight request');
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
  });

  return router;
}
