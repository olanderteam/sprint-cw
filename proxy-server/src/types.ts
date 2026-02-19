/**
 * Shared TypeScript types for the Jira proxy server
 */

export interface ProxyConfig {
  port: number;
  jiraDomain: string;
  jiraEmail: string;
  jiraApiToken: string;
  cacheTTL: number;
  environment: 'development' | 'production';
}

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
    story_points?: number;
    customfield_10028?: number;
    customfield_10016?: number;
    [key: string]: any;
  };
}
