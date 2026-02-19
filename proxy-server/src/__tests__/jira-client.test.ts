import axios from 'axios';
import { JiraClient } from '../jira-client';
import { ProxyConfig } from '../config';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JiraClient', () => {
  let client: JiraClient;
  let mockConfig: ProxyConfig;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock config
    mockConfig = {
      port: 3001,
      jiraDomain: 'test.atlassian.net',
      jiraEmail: 'test@example.com',
      jiraApiToken: 'test-token',
      cacheTTL: 120,
      environment: 'development',
    };

    // Mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    // Create client
    client = new JiraClient(mockConfig);
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.atlassian.net',
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        auth: {
          username: 'test@example.com',
          password: 'test-token',
        },
      });
    });

    it('should use HTTPS protocol', () => {
      const createCall = mockedAxios.create.mock.calls[0][0];
      expect(createCall?.baseURL).toMatch(/^https:\/\//);
    });

    it('should set timeout to 30 seconds', () => {
      const createCall = mockedAxios.create.mock.calls[0][0];
      expect(createCall?.timeout).toBe(30000);
    });

    it('should configure Basic Auth', () => {
      const createCall = mockedAxios.create.mock.calls[0][0];
      expect(createCall?.auth).toEqual({
        username: 'test@example.com',
        password: 'test-token',
      });
    });
  });

  describe('getAllBoards', () => {
    it('should fetch all boards with pagination', async () => {
      // Mock first page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 50,
          startAt: 0,
          total: 75,
          isLast: false,
          values: [
            { id: 1, name: 'Board 1', type: 'scrum' },
            { id: 2, name: 'Board 2', type: 'kanban' },
          ],
        },
      });

      // Mock second page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 50,
          startAt: 50,
          total: 75,
          isLast: true,
          values: [
            { id: 3, name: 'Board 3', type: 'scrum' },
          ],
        },
      });

      const boards = await client.getAllBoards();

      expect(boards).toHaveLength(3);
      expect(boards[0]).toEqual({ id: 1, name: 'Board 1', type: 'scrum' });
      expect(boards[2]).toEqual({ id: 3, name: 'Board 3', type: 'scrum' });
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle single page response', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 50,
          startAt: 0,
          total: 2,
          isLast: true,
          values: [
            { id: 1, name: 'Board 1', type: 'scrum' },
          ],
        },
      });

      const boards = await client.getAllBoards();

      expect(boards).toHaveLength(1);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveSprint', () => {
    it('should return active sprint if exists', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          values: [
            {
              id: 100,
              name: 'Sprint 1',
              state: 'active',
              startDate: '2024-01-01',
              endDate: '2024-01-14',
            },
          ],
        },
      });

      const sprint = await client.getActiveSprint(1);

      expect(sprint).toEqual({
        id: 100,
        name: 'Sprint 1',
        state: 'active',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/rest/agile/1.0/board/1/sprint',
        { params: { state: 'active' } }
      );
    });

    it('should return null if no active sprint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          values: [],
        },
      });

      const sprint = await client.getActiveSprint(1);

      expect(sprint).toBeNull();
    });
  });

  describe('getSprintIssues', () => {
    it('should fetch all issues with pagination', async () => {
      // Mock first page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 100,
          startAt: 0,
          total: 150,
          issues: [
            { id: '1', key: 'PROJ-1', fields: { summary: 'Issue 1' } },
            { id: '2', key: 'PROJ-2', fields: { summary: 'Issue 2' } },
          ],
        },
      });

      // Mock second page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 100,
          startAt: 100,
          total: 150,
          issues: [
            { id: '3', key: 'PROJ-3', fields: { summary: 'Issue 3' } },
          ],
        },
      });

      const issues = await client.getSprintIssues(1, 100);

      expect(issues).toHaveLength(3);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getClosedSprints', () => {
    it('should fetch closed sprints with limit', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          values: [
            { id: 99, name: 'Sprint 99', state: 'closed' },
            { id: 98, name: 'Sprint 98', state: 'closed' },
          ],
        },
      });

      const sprints = await client.getClosedSprints(1, 5);

      expect(sprints).toHaveLength(2);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/rest/agile/1.0/board/1/sprint',
        { params: { state: 'closed', maxResults: 5 } }
      );
    });

    it('should use default limit of 5', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { values: [] },
      });

      await client.getClosedSprints(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/rest/agile/1.0/board/1/sprint',
        { params: { state: 'closed', maxResults: 5 } }
      );
    });
  });

  describe('getBoardHistory', () => {
    it('should fetch all board issues with pagination', async () => {
      // Mock first page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 100,
          startAt: 0,
          total: 120,
          issues: [
            { id: '1', key: 'PROJ-1', fields: { summary: 'Issue 1' } },
          ],
        },
      });

      // Mock second page
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          maxResults: 100,
          startAt: 100,
          total: 120,
          issues: [
            { id: '2', key: 'PROJ-2', fields: { summary: 'Issue 2' } },
          ],
        },
      });

      const issues = await client.getBoardHistory(1);

      expect(issues).toHaveLength(2);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle and log errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockAxiosInstance.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            errorMessages: ['Unauthorized'],
          },
        },
        config: {
          url: '/rest/agile/1.0/board',
        },
        message: 'Request failed',
      });

      await expect(client.getAllBoards()).rejects.toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
