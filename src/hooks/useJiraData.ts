import { useQuery } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import { DashboardData } from '@/types/dashboard';

export function useJiraData() {
  return useQuery<DashboardData>({
    queryKey: ['jira-dashboard'],
    queryFn: async () => {
      const response = await fetch(`${API_CONFIG.proxyUrl}/api/jira-data`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch Jira data' }));
        throw new Error(error.error || 'Failed to fetch Jira data');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 min
    retry: 1,
  });
}
