import axios, { AxiosInstance, AxiosError } from 'axios';
import { ProxyConfig } from './config';

/**
 * Jira API models
 */
export interface Board {
  id: number;
  name: string;
  type: 'scrum' | 'kanban';
}

export interface Sprint {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface Issue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string };
    issuetype: { name: string };
    created: string;
    resolutiondate?: string;
    flagged?: boolean;
    // Story points can be in different custom fields
    story_points?: number;
    customfield_10028?: number;
    customfield_10016?: number;
    [key: string]: any;
  };
}

/**
 * Jira API response types
 */
interface BoardsResponse {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: Board[];
}

interface SprintsResponse {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: Sprint[];
}

interface IssuesResponse {
  maxResults: number;
  startAt: number;
  total: number;
  issues: Issue[];
}

/**
 * Client for communicating with Jira API
 */
export class JiraClient {
  private axiosInstance: AxiosInstance;
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: `https://${config.jiraDomain}`,
      timeout: 30000, // 30 seconds
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      auth: {
        username: config.jiraEmail,
        password: config.jiraApiToken,
      },
    });

    // Add response interceptor for retry logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config;
        
        // Retry logic for 429 (rate limit) errors
        if (error.response?.status === 429 && config) {
          const retryCount = (config as any).retryCount || 0;
          
          if (retryCount < 3) {
            (config as any).retryCount = retryCount + 1;
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return this.axiosInstance(config);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch all boards with pagination, optionally filtered by project keys
   */
  async getAllBoards(projectKeys?: string[]): Promise<Board[]> {
    const boards: Board[] = [];
    
    // If project keys are specified, fetch boards for each project
    if (projectKeys && projectKeys.length > 0) {
      console.log(`[JiraClient] Fetching boards for projects: ${projectKeys.join(', ')}`);
      
      for (const projectKey of projectKeys) {
        try {
          let startAt = 0;
          const maxResults = 50;
          let isLast = false;

          while (!isLast) {
            const response = await this.axiosInstance.get<BoardsResponse>(
              '/rest/agile/1.0/board',
              {
                params: {
                  projectKeyOrId: projectKey,
                  startAt,
                  maxResults,
                },
              }
            );

            // Avoid duplicates
            response.data.values.forEach(board => {
              if (!boards.find(b => b.id === board.id)) {
                boards.push(board);
              }
            });

            isLast = response.data.isLast;
            startAt += maxResults;
          }
        } catch (error) {
          console.warn(`[JiraClient] Failed to fetch boards for project ${projectKey}:`, error);
          // Continue with other projects
        }
      }
    } else {
      // Fetch all boards without filter
      let startAt = 0;
      const maxResults = 50;
      let isLast = false;

      while (!isLast) {
        try {
          const response = await this.axiosInstance.get<BoardsResponse>(
            '/rest/agile/1.0/board',
            {
              params: {
                startAt,
                maxResults,
              },
            }
          );

          boards.push(...response.data.values);
          isLast = response.data.isLast;
          startAt += maxResults;
        } catch (error) {
          this.handleError(error, 'getAllBoards');
          throw error;
        }
      }
    }

    // Log all boards found for debugging
    console.log(`[JiraClient] Found ${boards.length} total boards:`);
    boards.forEach(board => {
      console.log(`  - ID: ${board.id}, Name: "${board.name}", Type: ${board.type}`);
    });

    return boards;
  }

  /**
   * Get the active sprint for a board
   */
  async getActiveSprint(boardId: number): Promise<Sprint | null> {
    try {
      const response = await this.axiosInstance.get<SprintsResponse>(
        `/rest/agile/1.0/board/${boardId}/sprint`,
        {
          params: {
            state: 'active',
          },
        }
      );

      // Return the first active sprint, or null if none found
      return response.data.values[0] || null;
    } catch (error) {
      this.handleError(error, `getActiveSprint(${boardId})`);
      throw error;
    }
  }

  /**
   * Get ALL sprints for a board (active, closed, and future) with pagination
   * @param boardId - Board ID
   * @param maxResults - Maximum results per page (default 50)
   * @returns Array of all sprints
   */
  async getAllSprints(boardId: number, maxResults: number = 50): Promise<Sprint[]> {
    const sprints: Sprint[] = [];
    let startAt = 0;
    let total = 0;

    do {
      try {
        const response = await this.axiosInstance.get<SprintsResponse>(
          `/rest/agile/1.0/board/${boardId}/sprint`,
          {
            params: {
              startAt,
              maxResults,
            },
          }
        );

        sprints.push(...response.data.values);
        total = response.data.total;
        startAt += maxResults;
      } catch (error) {
        // Handle 400 error - board doesn't support sprints (Kanban board)
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          console.log(`[JiraClient] Board ${boardId} doesn't support sprints (Kanban board) - skipping`);
          return []; // Return empty array for Kanban boards
        }
        
        this.handleError(error, `getAllSprints(${boardId})`);
        throw error;
      }
    } while (startAt < total);

    console.log(`[JiraClient] Board ${boardId}: Found ${sprints.length} total sprints (active: ${sprints.filter(s => s.state === 'active').length}, closed: ${sprints.filter(s => s.state === 'closed').length}, future: ${sprints.filter(s => s.state === 'future').length})`);

    return sprints;
  }

  /**
   * Get issues for a specific sprint with pagination
   */
  async getSprintIssues(boardId: number, sprintId: number): Promise<Issue[]> {
    const issues: Issue[] = [];
    let startAt = 0;
    const maxResults = 100;
    let total = 0;

    do {
      try {
        const response = await this.axiosInstance.get<IssuesResponse>(
          `/rest/agile/1.0/board/${boardId}/sprint/${sprintId}/issue`,
          {
            params: {
              startAt,
              maxResults,
            },
          }
        );

        issues.push(...response.data.issues);
        total = response.data.total;
        startAt += maxResults;
      } catch (error) {
        this.handleError(error, `getSprintIssues(${boardId}, ${sprintId})`);
        throw error;
      }
    } while (startAt < total);

    return issues;
  }

  /**
   * Get closed sprints for a board
   */
  async getClosedSprints(boardId: number, limit: number = 5): Promise<Sprint[]> {
    try {
      const response = await this.axiosInstance.get<SprintsResponse>(
        `/rest/agile/1.0/board/${boardId}/sprint`,
        {
          params: {
            state: 'closed',
            maxResults: limit,
          },
        }
      );

      return response.data.values;
    } catch (error) {
      this.handleError(error, `getClosedSprints(${boardId})`);
      throw error;
    }
  }

  /**
   * Get board history (all issues from the board)
   */
  async getBoardHistory(boardId: number): Promise<Issue[]> {
    const issues: Issue[] = [];
    let startAt = 0;
    const maxResults = 100;
    let total = 0;

    do {
      try {
        const response = await this.axiosInstance.get<IssuesResponse>(
          `/rest/agile/1.0/board/${boardId}/issue`,
          {
            params: {
              startAt,
              maxResults,
            },
          }
        );

        issues.push(...response.data.issues);
        total = response.data.total;
        startAt += maxResults;
      } catch (error) {
        this.handleError(error, `getBoardHistory(${boardId})`);
        throw error;
      }
    } while (startAt < total);

    return issues;
  }

  /**
   * Handle and log errors
   */
  private handleError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.errorMessages?.[0] || error.message;
      
      console.error(`[JiraClient] Error in ${context}:`, {
        status,
        message,
        url: error.config?.url,
      });
    } else {
      console.error(`[JiraClient] Unexpected error in ${context}:`, error);
    }
  }
}
