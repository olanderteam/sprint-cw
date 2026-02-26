import { useState, useMemo } from 'react';
import { mockDashboardData } from '@/data/mockData';
import { useJiraData } from '@/hooks/useJiraData';
import { SquadData } from '@/types/dashboard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SquadCard from '@/components/dashboard/SquadCard';
import VelocityChart from '@/components/dashboard/VelocityChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import AdvancedFilters, { FilterValues } from '@/components/dashboard/AdvancedFilters';
import CapacityChart from '@/components/dashboard/CapacityChart';
import CreatedVsCompleted from '@/components/charts/CreatedVsCompleted';
import CumulativeFlowDiagram from '@/components/charts/CumulativeFlowDiagram';
import CycleTimeByType from '@/components/charts/CycleTimeByType';
import TimeInStatusHeatmap from '@/components/charts/TimeInStatusHeatmap';
import PriorityEvolution from '@/components/charts/PriorityEvolution';
import TaskTable from '@/components/dashboard/TaskTable';
import SquadDetailPanel from '@/components/dashboard/SquadDetailPanel';
import WorkItemAge from '@/components/dashboard/WorkItemAge';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [selectedSquad, setSelectedSquad] = useState<SquadData | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    assignee: [],
    priority: [],
    status: [],
    issueType: [],
    squad: [],
    sprint: [],
  });
  
  const { data: jiraData, isLoading, isError, error, refetch, dataUpdatedAt } = useJiraData();

  // Only use mock data if there's an error AND no data
  const data = jiraData || (isError ? mockDashboardData : null);
  const isLive = !!jiraData;

  // Calculate all derived values before any conditional returns
  const overallPercentage = data?.sprint.totalStoryPoints 
    ? Math.round((data.sprint.completedStoryPoints / data.sprint.totalStoryPoints) * 100)
    : 0;

  const criticalAlerts = data?.alerts.filter(a => a.type === 'critical').length || 0;

  // Extract unique filter options from data
  const availableOptions = useMemo(() => {
    if (!data) return {
      assignees: [],
      priorities: [],
      statuses: [],
      issueTypes: [],
      squads: [],
      sprints: [],
    };

    const priorities = new Set<string>();
    const statuses = new Set<string>();
    const squads = new Set<string>();

    // Collect priorities, statuses, and squads from current sprint tasks
    data.tasks.forEach(task => {
      if (task.priority) priorities.add(task.priority);
      if (task.status) statuses.add(task.status);
      if (task.squad) squads.add(task.squad);
    });

    // Use backend-provided lists for assignees and issue types (includes ALL from all boards)
    const assignees = data.availableAssignees || [];
    const issueTypes = data.availableIssueTypes || [];

    // Use availableSprints from backend (includes ALL sprints from all boards)
    const sprints = data.availableSprints?.map(s => s.name) || [];

    return {
      assignees: assignees.length > 0 ? assignees : Array.from(new Set(data.tasks.map(t => t.assignee))).sort(),
      priorities: Array.from(priorities).sort(),
      statuses: Array.from(statuses).sort(),
      issueTypes: issueTypes.length > 0 ? issueTypes : Array.from(new Set(data.tasks.map(t => t.type))).sort(),
      squads: Array.from(squads).sort(),
      sprints: sprints, // Already sorted by backend (newest first)
    };
  }, [data]);

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    if (!data) return [];
    
    return data.tasks.filter(task => {
      if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
      if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
      if (filters.issueType.length > 0 && !filters.issueType.includes(task.type)) return false;
      if (filters.squad.length > 0 && !filters.squad.includes(task.squad)) return false;
      if (filters.sprint.length > 0 && !filters.sprint.includes(task.sprint)) return false;
      return true;
    });
  }, [data, filters]);

  // Filter squads based on selected squad filter
  const filteredSquads = useMemo(() => {
    if (!data) return [];
    if (filters.squad.length === 0) return data.squads;
    return data.squads.filter(s => filters.squad.includes(s.name));
  }, [data, filters.squad]);

  const handleRefresh = () => {
    refetch();
  };

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : 'just now';

  // Show loading state if no data yet
  if (!data && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dados do Jira...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data and error
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <p className="text-sm text-destructive">Erro ao carregar dados do Jira</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Loading / Error banners */}
        {isLoading && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching live data from Jira…
          </div>
        )}
        {isError && (
          <div className="mb-4 rounded-lg badge-warning px-4 py-3 text-sm">
            ⚠️ Could not load Jira data: {(error as Error)?.message || 'Unknown error'}. Showing mock data.
          </div>
        )}

        <DashboardHeader
          sprint={data.sprint}
          overallPercentage={overallPercentage}
          criticalAlerts={criticalAlerts}
          onRefresh={handleRefresh}
        />

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {filteredSquads.length} Squad{filteredSquads.length !== 1 ? 's' : ''}
            {filteredTasks.length !== data.tasks.length && (
              <span className="ml-2 text-xs">
                ({filteredTasks.length} de {data.tasks.length} tasks)
              </span>
            )}
          </h2>
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableOptions={availableOptions}
          />
        </div>

        {/* Squad Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSquads.map(squad => (
            <SquadCard key={squad.id} squad={squad} filteredTasks={filteredTasks} onViewDetails={setSelectedSquad} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <VelocityChart squads={data.squads} />
          <CapacityChart squads={data.squads} />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <CreatedVsCompleted data={data.createdVsCompleted} />
          <CumulativeFlowDiagram data={data.cumulativeFlow} />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <WorkItemAge data={data.workItemAge || []} />
          <PriorityEvolution data={data.priorityEvolution} />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <CycleTimeByType data={data.cycleTimeByType} />
          <TimeInStatusHeatmap data={data.timeInStatus} />
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <AlertsPanel alerts={data.alerts} />
        </div>

        {/* Task Table */}
        <div className="mb-8">
          <TaskTable tasks={filteredTasks} />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          Data source: {isLive ? 'Jira (Live)' : 'Mock'} · Last updated: {lastUpdated}
        </p>
      </div>

      {/* Squad Detail Panel */}
      {selectedSquad && (
        <SquadDetailPanel
          squad={selectedSquad}
          personDistribution={data.personDistribution[selectedSquad.id] ?? []}
          tasks={filteredTasks}
          alerts={data.alerts}
          availableSprints={data.availableSprints}
          onClose={() => setSelectedSquad(null)}
        />
      )}
    </div>
  );
};

export default Index;
