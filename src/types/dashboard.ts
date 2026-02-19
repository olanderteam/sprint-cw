export type HealthStatus = 'green' | 'yellow' | 'red';

export interface SprintInfo {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  goal: string;
}

// ... (keep existing interfaces)

export interface WorkItemAgeItem {
  key: string;
  summary: string;
  age: number;
  storyPoints: number;
  status: string;
  assignee: string;
}

export interface SquadData {
  goal?: string;
}

export interface DashboardData {
  sprint: SprintInfo;
  squads: SquadData[];
  alerts: Alert[];
  createdVsCompleted: CreatedVsCompletedPoint[];
  cumulativeFlow: CumulativeFlowPoint[];
  cycleTimeByType: CycleTimeByTypeItem[];
  timeInStatus: TimeInStatusRow[];
  priorityEvolution: PriorityEvolutionPoint[];
  personDistribution: Record<string, PersonDistributionItem[]>;
  tasks: TaskItem[];
  workItemAge: WorkItemAgeItem[];
  availableSprints: SprintInfo[]; // List of all available sprints
  availableAssignees?: string[]; // List of all unique assignees across all boards
  availableIssueTypes?: string[]; // List of all unique issue types across all boards
}

export type FilterOption = 'all' | 'at-risk' | 'critical';
export type SprintFilter = 'current' | 'previous';
