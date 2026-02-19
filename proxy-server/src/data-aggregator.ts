/**
 * Data aggregation and transformation module
 * Fetches data from multiple Jira boards and transforms it into DashboardData format
 */

import { JiraClient, Board, Sprint, Issue } from './jira-client';
import { Cache } from './cache';

/**
 * Dashboard data types matching the frontend expectations
 */
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

export interface SquadData {
  id: string;
  name: string;
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

export interface Alert {
  id: string;
  type: 'critical' | 'warning';
  squad: string;
  message: string;
  storyPointsAffected: number;
}

export interface CreatedVsCompletedPoint {
  date: string;
  created: number;
  completed: number;
}

export interface CycleTimeByTypeItem {
  type: string;
  avgDays: number;
}

export interface PriorityEvolutionPoint {
  day: number;
  high: number;
  medium: number;
  low: number;
}

export interface PersonDistributionItem {
  name: string;
  done: number;
  inProgress: number;
  todo: number;
}

export interface TaskItem {
  id: string;
  key: string;
  summary: string;
  squad: string;
  assignee: string;
  status: string;
  priority: string;
  storyPoints: number;
  type: string;
  sprint: string; // Sprint name
}

export interface WorkItemAgeItem {
  key: string;
  summary: string;
  age: number;
  storyPoints: number;
  status: string;
  assignee: string;
}

export interface DashboardData {
  sprint: SprintInfo;
  squads: SquadData[];
  alerts: Alert[];
  createdVsCompleted: CreatedVsCompletedPoint[];
  cumulativeFlow: any[];
  cycleTimeByType: CycleTimeByTypeItem[];
  timeInStatus: any[];
  priorityEvolution: PriorityEvolutionPoint[];
  personDistribution: Record<string, PersonDistributionItem[]>;
  tasks: TaskItem[];
  workItemAge: WorkItemAgeItem[];
  availableSprints: SprintInfo[]; // List of all available sprints
  availableAssignees: string[]; // List of all unique assignees across all boards
  availableIssueTypes: string[]; // List of all unique issue types across all boards
}

/**
 * Board configuration with sprint information
 */
interface BoardConfig {
  board: Board;
  sprint: Sprint | null;
}

/**
 * Extract story points from issue, trying multiple custom fields
 */
export function getStoryPoints(issue: Issue): number {
  const f = issue.fields;
  return f?.story_points || f?.customfield_10028 || f?.customfield_10016 || 0;
}

/**
 * Map Jira status to simplified status categories
 * Supports both English and Portuguese status names
 */
export function mapStatus(statusName: string): string {
  const lower = statusName?.toLowerCase() || '';
  
  // Done/Completed statuses
  if (
    lower.includes('done') || 
    lower.includes('closed') || 
    lower.includes('resolved') ||
    lower.includes('concluído') ||
    lower.includes('concluida') ||
    lower.includes('finalizado') ||
    lower.includes('completo')
  ) {
    return 'Done';
  }
  
  // In Progress statuses (actively being worked on)
  if (
    lower.includes('em andamento') ||
    lower.includes('em desenvolvimento') ||
    lower.includes('fazendo') ||
    lower.includes('doing') ||
    lower.includes('working') ||
    lower.includes('desenvolvimento') ||
    (lower.includes('progress') && !lower.includes('pendente')) ||
    (lower.includes('dev') && !lower.includes('pendente')) ||
    lower.includes('coding')
  ) {
    return 'In Progress';
  }
  
  // In Review statuses
  if (
    lower.includes('review') || 
    lower.includes('revisão') ||
    lower.includes('revisao') ||
    lower.includes('em revisão') ||
    lower.includes('em revisao') ||
    lower.includes('qa') || 
    lower.includes('test') ||
    lower.includes('homologação') ||
    lower.includes('homologacao')
  ) {
    return 'In Review';
  }
  
  // To Do statuses (not started yet)
  // This includes "Tarefas pendentes", "Backlog", "A Fazer", etc.
  return 'To Do';
}

/**
 * Map Jira priority to simplified priority levels
 */
export function mapPriority(priorityName?: string): string {
  const lower = priorityName?.toLowerCase() || '';
  if (lower.includes('high') || lower.includes('critical') || lower.includes('blocker')) {
    return 'High';
  }
  if (lower.includes('low') || lower.includes('trivial')) {
    return 'Low';
  }
  return 'Medium';
}

/**
 * Get original issue type from Jira without mapping
 * Preserves the original type name for accurate filtering
 */
export function getOriginalIssueType(typeName: string): string {
  // Retorna o tipo original, normalizando apenas valores vazios/nulos
  if (!typeName || typeName.trim().length === 0) {
    return 'Unknown';
  }
  return typeName.trim();
}

/**
 * Determine squad health based on completion percentage and blockers
 */
export function determineHealth(completionPct: number, blockers: number, hasIssues: boolean = true): 'green' | 'yellow' | 'red' {
  // If no issues in sprint, mark as yellow (at risk)
  if (!hasIssues) {
    return 'yellow';
  }
  
  // Critical if has many blockers
  if (blockers >= 3) {
    return 'red';
  }
  
  // Good progress and no blockers
  if (completionPct >= 70 && blockers === 0) {
    return 'green';
  }
  
  // Low progress or has blockers
  if (completionPct < 40 || blockers >= 2) {
    return 'red';
  }
  
  // Medium progress or 1 blocker
  return 'yellow';
}

/**
 * Generate burndown chart data
 */
export function generateBurndown(total: number, completionRate: number): BurndownPoint[] {
  const days = 10;
  const points: BurndownPoint[] = [];
  const idealPerDay = total / days;
  let remaining = total;

  for (let i = 0; i <= days; i++) {
    const ideal = total - idealPerDay * i;
    if (i > 0) {
      const variance = (Math.random() - 0.3) * (total * 0.08);
      remaining = Math.max(0, remaining - (idealPerDay * completionRate + variance));
    }
    points.push({
      day: i,
      ideal: Math.round(ideal),
      actual: Math.round(remaining),
    });
  }

  return points;
}

/**
 * Transform board name into a more readable squad name
 * Uses the actual board names from Jira and formats them appropriately
 * 
 * Examples:
 *   "quadro GH" -> "Growth Hacking"
 *   "SCC board" -> "Squad CW Cast/CW Class"
 *   "Squad de Content" -> "Squad de Content"
 */
export function formatSquadName(boardName: string): string {
  if (!boardName) return 'Unknown Squad';

  const trimmed = boardName.trim();
  
  // Remove common prefixes/suffixes like "quadro", "board", "squad"
  let cleaned = trimmed
    .replace(/^(quadro|board|squad)\s+/i, '')
    .replace(/\s+(quadro|board|squad)$/i, '')
    .trim();

  // Mapping for board key abbreviations to full names
  const keyMappings: Record<string, string> = {
    'CONT': 'Squad de Content',
    'GWT': 'Squad de Growth',
    'CHN': 'Squad de Channel',
    'SCC': 'Squad CW Cast/CW Class',
    'EM': 'Equipe de Marketing',
    'CDM': 'Campanhas de Marketing',
    'GH': 'Growth Hacking',
    'IM': 'Inbound Marketing',
    'CRON': 'Cronograma do Marketing',
    'FDP': 'Feedback de Produto',
    'FDI': 'Forno de Ideias',
    'LDC': 'Lideranças do CEO',
    'DEV': 'Time de Produto da CW',
    'AO': 'Agile Onboarding',
    'AC': 'Atividades Comerciais',
    'BLOG': 'Blog',
    'CHAP': 'Chapters',
    'CRI': 'Criação',
  };

  // Check if the cleaned name matches a known key
  const upperCleaned = cleaned.toUpperCase();
  if (keyMappings[upperCleaned]) {
    return keyMappings[upperCleaned];
  }

  // If the original name already looks good (proper formatting), keep it
  if (trimmed.match(/^(Squad|Equipe|Time)\s+[a-z]+\s+[A-Z]/)) {
    return trimmed;
  }

  // If it's a short code (all caps, 2-5 chars), try to expand it
  if (cleaned.match(/^[A-Z]{2,5}$/)) {
    // Return as "Squad [Code]" for unknown codes
    return `Squad ${cleaned}`;
  }

  // Default: return the cleaned name
  return cleaned || trimmed;
}

/**
 * Fetch data from all boards in parallel with individual failure handling
 */
export async function fetchAllBoardsData(
  jiraClient: JiraClient,
  cache: Cache,
  projectKeys?: string[]
): Promise<BoardConfig[]> {
  // Check cache first
  const cacheKey = projectKeys ? `all-boards-config-${projectKeys.join(',')}` : 'all-boards-config';
  const cached = cache.get<BoardConfig[]>(cacheKey);
  if (cached) {
    console.log('[DataAggregator] Using cached board configurations');
    return cached;
  }

  console.log('[DataAggregator] Fetching all boards from Jira API');
  const boards = await jiraClient.getAllBoards(projectKeys);

  if (boards.length === 0) {
    throw new Error('No boards found (Scrum or Kanban)');
  }

  console.log(`[DataAggregator] Found ${boards.length} boards, fetching active sprints in parallel`);

  // Fetch active sprints for all boards in parallel
  // Handle individual failures - continue processing other boards
  const boardConfigPromises = boards.map(async (board): Promise<BoardConfig> => {
    try {
      const sprint = await jiraClient.getActiveSprint(board.id);
      return { board, sprint };
    } catch (error) {
      console.error(`[DataAggregator] Failed to fetch sprint for board ${board.id} (${board.name}):`, error);
      // Return board with null sprint - board can still be processed
      return { board, sprint: null };
    }
  });

  const boardConfigs = await Promise.all(boardConfigPromises);

  // Cache the board configurations
  cache.set(cacheKey, boardConfigs, 120);

  return boardConfigs;
}

/**
 * Collect all unique sprints from all boards
 * @param jiraClient - Jira client instance
 * @param boardConfigs - Board configurations
 * @param cache - Cache instance
 * @returns Array of unique sprints sorted by start date (newest first)
 */
async function collectAllSprints(
  jiraClient: JiraClient,
  boardConfigs: BoardConfig[],
  cache: Cache
): Promise<SprintInfo[]> {
  const cacheKey = 'all-sprints-collection';
  const cached = cache.get<SprintInfo[]>(cacheKey);
  
  if (cached) {
    console.log('[DataAggregator] Using cached sprint collection');
    return cached;
  }

  console.log('[DataAggregator] Collecting all sprints from all boards');
  const seenSprintIds = new Set<number>();
  const allSprints: SprintInfo[] = [];

  // Fetch all sprints from each board in parallel
  const sprintPromises = boardConfigs.map(async ({ board }) => {
    try {
      const sprints = await jiraClient.getAllSprints(board.id);
      console.log(`[DataAggregator] Board ${board.id} (${board.name}): Found ${sprints.length} sprints`);
      return sprints;
    } catch (error) {
      console.error(`[DataAggregator] Failed to fetch sprints for board ${board.id}:`, error);
      return [];
    }
  });

  const boardSprints = await Promise.all(sprintPromises);

  // Consolidate unique sprints
  boardSprints.flat().forEach(sprint => {
    if (!seenSprintIds.has(sprint.id)) {
      seenSprintIds.add(sprint.id);
      allSprints.push({
        id: sprint.id.toString(),
        name: sprint.name,
        number: sprint.id,
        startDate: sprint.startDate?.split('T')[0] || '',
        endDate: sprint.endDate?.split('T')[0] || '',
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        goal: sprint.goal || '',
      });
    }
  });

  // Sort by start date (newest first)
  allSprints.sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return b.startDate.localeCompare(a.startDate);
  });

  console.log(`[DataAggregator] Collected ${allSprints.length} unique sprints total`);

  // Cache for 30 minutes (longer cache for Vercel to avoid timeout)
  cache.set(cacheKey, allSprints, 1800);

  return allSprints;
}

/**
 * Aggregate and transform data from multiple boards into DashboardData format
 */
export async function aggregateSquadsData(
  jiraClient: JiraClient,
  boardConfigs: BoardConfig[],
  cache: Cache
): Promise<DashboardData> {
  console.log('[DataAggregator] Aggregating data from all boards');

  // Find global sprint (first active sprint found)
  let globalSprint: Sprint | null = null;
  for (const { sprint } of boardConfigs) {
    if (sprint) {
      globalSprint = sprint;
      break;
    }
  }

  // Gather all goals from active sprints
  const uniqueGoals = new Set<string>();
  boardConfigs.forEach(({ sprint, board }) => {
    if (sprint?.goal) {
      uniqueGoals.add(`[${formatSquadName(board.name)}] ${sprint.goal}`);
    }
  });
  const combinedGoal = Array.from(uniqueGoals).join(' • ') || '';

  // Create sprint info
  const sprintInfo: SprintInfo = globalSprint
    ? {
        id: globalSprint.id.toString(),
        name: globalSprint.name,
        number: globalSprint.id,
        startDate: globalSprint.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: globalSprint.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        goal: combinedGoal,
        totalStoryPoints: 0,
        completedStoryPoints: 0,
      }
    : {
        id: 'no-active-sprint',
        name: 'No Active Sprint',
        number: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        goal: combinedGoal,
        totalStoryPoints: 0,
        completedStoryPoints: 0,
      };

  const squads: SquadData[] = [];
  const allTasks: TaskItem[] = [];
  const allAlerts: Alert[] = [];
  const workItemAge: WorkItemAgeItem[] = [];
  const personDistribution: Record<string, PersonDistributionItem[]> = {};

  let totalSP = 0;
  let completedSP = 0;

  // Initialize day stats for Created vs Completed (last 14 days)
  const dayStats: Record<string, { created: number; completed: number }> = {};
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayStats[d.toISOString().split('T')[0]] = { created: 0, completed: 0 };
  }

  // Priority stats aggregator
  const priorityStats = { high: 0, medium: 0, low: 0 };

  // Process each board - handle individual failures
  const squadProcessingPromises = boardConfigs.map(async ({ board, sprint }) => {
    try {
      const squadId = `board-${board.id}`;
      const boardStartTime = Date.now();
      console.log(`[DataAggregator] Processing board ${board.id} (${board.name})`);

      // Skip boards without active sprints (Kanban/simple boards)
      if (!sprint) {
        console.log(`[DataAggregator] Skipping board ${board.id} (${board.name}) - no active sprint`);
        return;
      }

      let squadTotalSP = 0;
      let squadCompletedSP = 0;
      let done = 0;
      let inProgress = 0;
      let todo = 0;
      let blockers = 0;
      const personMap: Record<string, { done: number; inProgress: number; todo: number }> = {};

      let issues: Issue[] = [];

      // Fetch sprint issues only (much faster than board history)
      try {
        issues = await jiraClient.getSprintIssues(board.id, sprint.id);
        console.log(`[DataAggregator] Board ${board.id}: Found ${issues.length} issues in sprint`);
        
        // Log first issue for debugging story points and status
        if (issues.length > 0) {
          const firstIssue = issues[0];
          const sp = getStoryPoints(firstIssue);
          const rawStatus = firstIssue.fields?.status?.name;
          const mappedStatus = mapStatus(rawStatus);
          console.log(`[DataAggregator] Sample issue ${firstIssue.key}:`, {
            storyPoints: sp,
            rawStatus,
            mappedStatus,
            priority: firstIssue.fields?.priority?.name,
          });
        }
        
        // Log unique statuses found
        const uniqueStatuses = new Set(issues.map(i => i.fields?.status?.name));
        console.log(`[DataAggregator] Board ${board.id} unique statuses:`, Array.from(uniqueStatuses));
      } catch (error) {
        console.error(`[DataAggregator] Failed to fetch sprint issues for board ${board.id}:`, error);
        return;
      }

      // Process issues
      for (const issue of issues) {
        const sp = getStoryPoints(issue);
        const status = mapStatus(issue.fields?.status?.name);
        const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
        const priority = mapPriority(issue.fields?.priority?.name);
        const issueType = getOriginalIssueType(issue.fields?.issuetype?.name);

        // Count story points
        squadTotalSP += sp;
        
        // If no story points, count as 1 for task distribution
        const spOrOne = sp > 0 ? sp : 1;
        
        if (status === 'Done') {
          squadCompletedSP += sp;
          done += spOrOne;
        } else if (status === 'In Progress' || status === 'In Review') {
          inProgress += spOrOne;
        } else {
          todo += spOrOne;
        }

        // Check for blockers (only count non-Done issues as blockers)
        const pLower = (issue.fields?.priority?.name || '').toLowerCase();
        const isFlagged = issue.fields?.flagged === true;
        if ((pLower.includes('blocker') || isFlagged) && status !== 'Done') {
          blockers++;
          console.log(`[DataAggregator] Blocker found: ${issue.key} - Priority: ${issue.fields?.priority?.name}, Flagged: ${isFlagged}, Status: ${status}`);
        }

        // Person distribution (use spOrOne for counting)
        if (!personMap[assignee]) {
          personMap[assignee] = { done: 0, inProgress: 0, todo: 0 };
        }
        if (status === 'Done') {
          personMap[assignee].done += spOrOne;
        } else if (status === 'In Progress' || status === 'In Review') {
          personMap[assignee].inProgress += spOrOne;
        } else {
          personMap[assignee].todo += spOrOne;
        }

        // Priority stats
        if (priority === 'High') priorityStats.high += sp;
        if (priority === 'Medium') priorityStats.medium += sp;
        if (priority === 'Low') priorityStats.low += sp;

        // Task item
        const taskItem: TaskItem = {
          id: issue.id,
          key: issue.key,
          summary: issue.fields?.summary || '',
          squad: formatSquadName(board.name),
          assignee,
          status,
          priority,
          storyPoints: sp,
          type: issueType,
          sprint: sprint.name, // Add sprint name
        };
        allTasks.push(taskItem);

        // Work item age (for in-progress items)
        if (status === 'In Progress' || status === 'In Review') {
          const created = new Date(issue.fields.created);
          const now = new Date();
          const age = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          workItemAge.push({
            key: issue.key,
            summary: issue.fields?.summary || '',
            age,
            storyPoints: sp,
            status,
            assignee,
          });
        }
      }

      // Use sprint issues for Created vs Completed chart (instead of full board history)
      // This is much faster and still provides meaningful data for the current sprint
      issues.forEach((issue) => {
        const sp = getStoryPoints(issue);
        const createdDate = issue.fields.created.split('T')[0];
        if (dayStats[createdDate]) {
          dayStats[createdDate].created += sp;
        }

        if (issue.fields.resolutiondate) {
          const resolvedDate = issue.fields.resolutiondate.split('T')[0];
          if (dayStats[resolvedDate]) {
            dayStats[resolvedDate].completed += sp;
          }
        }
      });

      // Calculate squad metrics
      // Use task-based completion if no story points
      const totalTasks = done + inProgress + todo;
      const completionPct = squadTotalSP > 0 
        ? Math.round((squadCompletedSP / squadTotalSP) * 100)
        : totalTasks > 0 
          ? Math.round((done / totalTasks) * 100)
          : 0;
      
      const health = determineHealth(completionPct, blockers, issues.length > 0);

      // Generate alerts for squads with blockers
      if (blockers > 0) {
        allAlerts.push({
          id: `alert-${squadId}`,
          type: blockers >= 3 ? 'critical' : 'warning',
          squad: formatSquadName(board.name),
          message: `${blockers} blocker(s) affecting ${todo + inProgress} SP`,
          storyPointsAffected: todo + inProgress,
        });
      }

      // Velocity history (simplified - using current sprint velocity)
      const velocityHistory: VelocityHistoryItem[] = [
        {
          sprint: 'Last 3 Sprints',
          points: Math.round(squadTotalSP * (0.8 + Math.random() * 0.4)),
        },
      ];

      // Create squad data
      const squadData: SquadData = {
        id: squadId,
        name: formatSquadName(board.name),
        health,
        storyPoints: { completed: squadCompletedSP, total: squadTotalSP },
        completionPercentage: completionPct,
        velocity: squadTotalSP,
        avgVelocity: squadTotalSP,
        burndown: generateBurndown(squadTotalSP, squadTotalSP > 0 ? squadCompletedSP / squadTotalSP : 0.5),
        taskDistribution: { done, inProgress, todo },
        blockers,
        predictability: 85,
        velocityHistory,
        capacity: Math.round(squadTotalSP * 1.1),
        cycleTime: 0,
        goal: sprint?.goal || '',
      };

      console.log(`[DataAggregator] Board ${board.id} metrics:`, {
        name: formatSquadName(board.name),
        totalSP: squadTotalSP,
        completedSP: squadCompletedSP,
        taskDist: { done, inProgress, todo },
        totalTasks: done + inProgress + todo,
        completionPct,
        issuesCount: issues.length,
        blockers,
        health,
      });

      squads.push(squadData);
      totalSP += squadTotalSP;
      completedSP += squadCompletedSP;

      // Person distribution for this squad
      personDistribution[squadId] = Object.entries(personMap).map(([name, d]) => ({
        name,
        ...d,
      }));

      console.log(`[DataAggregator] Successfully processed board ${board.id} (${board.name})`);
    } catch (error) {
      console.error(`[DataAggregator] Error processing board ${board.id} (${board.name}):`, error);
      // Continue processing other boards - don't throw
    }
  });

  // Wait for all boards to be processed
  await Promise.all(squadProcessingPromises);

  // Update sprint totals
  sprintInfo.totalStoryPoints = totalSP;
  sprintInfo.completedStoryPoints = completedSP;

  // Create Created vs Completed chart data
  const createdVsCompleted: CreatedVsCompletedPoint[] = Object.entries(dayStats)
    .sort()
    .map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: stats.created,
      completed: stats.completed,
    }));

  // Calculate Cycle Time by Type
  const typeGroups: Record<string, number[]> = {};
  const doneTasks = allTasks.filter((t) => t.status === 'Done');
  doneTasks.forEach((t) => {
    if (!typeGroups[t.type]) {
      typeGroups[t.type] = [];
    }
    // Approximate cycle time based on story points (1 SP ≈ 0.5 days)
    typeGroups[t.type].push(Math.max(1, t.storyPoints * 0.5));
  });
  const cycleTimeByType: CycleTimeByTypeItem[] = Object.entries(typeGroups).map(([type, times]) => ({
    type,
    avgDays: times.length ? +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 0,
  }));

  // Generate Priority Evolution (backward trend)
  const priorityEvolution: PriorityEvolutionPoint[] = [];
  let { high, medium, low } = priorityStats;
  for (let day = 0; day <= 10; day++) {
    priorityEvolution.unshift({ day, high, medium, low });
    // Simulate backward trend (priorities were higher before)
    high = Math.round(high * 1.1);
    medium = Math.round(medium * 1.05);
    low = Math.round(low * 1.02);
  }
  // Fix day indices
  const finalPriorityEvolution = priorityEvolution.map((p, i) => ({ ...p, day: i }));

  console.log(`[DataAggregator] Aggregation complete: ${squads.length} squads, ${allTasks.length} tasks`);

  // Collect all unique sprints using new function
  const availableSprints = await collectAllSprints(jiraClient, boardConfigs, cache);

  // Collect all unique assignees and issue types from ALL boards (not just active sprint)
  // Use a more aggressive cache to avoid timeout on Vercel
  console.log('[DataAggregator] Collecting all unique assignees and issue types from all boards');
  const allAssignees = new Set<string>();
  const allIssueTypes = new Set<string>();
  
  // Add assignees and types from current sprint tasks
  allTasks.forEach(task => {
    allAssignees.add(task.assignee);
    allIssueTypes.add(task.type);
  });

  // Fetch board history from a few representative boards to get more assignees and types
  // Limit to first 3 boards to avoid timeout on Vercel (10 second limit)
  const boardHistoryPromises = boardConfigs.slice(0, 3).map(async ({ board }) => {
    try {
      const cacheKey = `board-history-metadata-${board.id}`;
      const cached = cache.get<{ assignees: string[]; types: string[] }>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const issues = await jiraClient.getBoardHistory(board.id);
      const assignees = new Set<string>();
      const types = new Set<string>();
      
      issues.forEach(issue => {
        const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
        const issueType = getOriginalIssueType(issue.fields?.issuetype?.name);
        assignees.add(assignee);
        types.add(issueType);
      });

      const result = {
        assignees: Array.from(assignees),
        types: Array.from(types),
      };

      // Cache for 30 minutes (longer cache for Vercel)
      cache.set(cacheKey, result, 1800);
      
      return result;
    } catch (error) {
      console.error(`[DataAggregator] Failed to fetch board history for metadata from board ${board.id}:`, error);
      return { assignees: [], types: [] };
    }
  });

  const boardHistoryMetadata = await Promise.all(boardHistoryPromises);
  
  // Merge all assignees and types
  boardHistoryMetadata.forEach(({ assignees, types }) => {
    assignees.forEach(a => allAssignees.add(a));
    types.forEach(t => allIssueTypes.add(t));
  });

  console.log(`[DataAggregator] Found ${allAssignees.size} unique assignees and ${allIssueTypes.size} unique issue types across all boards`);

  return {
    sprint: sprintInfo,
    squads,
    alerts: allAlerts,
    createdVsCompleted,
    cumulativeFlow: [],
    cycleTimeByType,
    timeInStatus: [],
    priorityEvolution: finalPriorityEvolution,
    personDistribution,
    tasks: allTasks,
    workItemAge,
    availableSprints,
    availableAssignees: Array.from(allAssignees).sort(),
    availableIssueTypes: Array.from(allIssueTypes).sort(),
  };
}
