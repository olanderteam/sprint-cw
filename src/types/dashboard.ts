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
  boardId?: number; // Add board ID reference to link sprints to boards
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
  id: string;
  name: string;
  boardId?: number; // Add board ID reference
  health: 'green' | 'yellow' | 'red';
  storyPoints: { completed: number; total: number };
  completionPercentage: number;
  velocity: number;
  avgVelocity: number;
  burndown: BurndownPoint[];
  taskDistribution: { done: number; inProgress: number; todo: number };
  blockers: number;
  predictability: number;
  velocityHistory: VelocityHistoryItem[];
  capacity: number;
  cycleTime: number;
  goal?: string;
}

export interface BurndownPoint {
  day: number;
  ideal: number;
  actual: number;
}

export interface VelocityHistoryItem {
  sprint: string;
  points: number;
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
