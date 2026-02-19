import {
  DashboardData,
  BurndownPoint,
  VelocityPoint,
  CreatedVsCompletedPoint,
  CumulativeFlowPoint,
  CycleTimeByTypeItem,
  TimeInStatusRow,
  PriorityEvolutionPoint,
  PersonDistributionItem,
  TaskItem,
} from '@/types/dashboard';

const generateBurndown = (total: number, completionRate: number): BurndownPoint[] => {
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
    points.push({ day: i, ideal: Math.round(ideal), actual: Math.round(remaining) });
  }
  return points;
};

const generateVelocityHistory = (avg: number): VelocityPoint[] => {
  return ['S42', 'S43', 'S44', 'S45', 'S46', 'S47'].map(sprint => ({
    sprint,
    points: Math.round(avg + (Math.random() - 0.5) * avg * 0.4),
  }));
};

const generateCreatedVsCompleted = (): CreatedVsCompletedPoint[] => {
  const points: CreatedVsCompletedPoint[] = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: Math.round(3 + Math.random() * 8),
      completed: Math.round(2 + Math.random() * 9),
    });
  }
  return points;
};

const generateCumulativeFlow = (): CumulativeFlowPoint[] => {
  const points: CumulativeFlowPoint[] = [];
  let done = 0, inProgress = 15, todo = 125;
  for (let day = 0; day <= 10; day++) {
    points.push({ day, todo, inProgress, done });
    const completed = Math.round(8 + Math.random() * 6);
    const started = Math.round(6 + Math.random() * 5);
    done += completed;
    inProgress = Math.max(0, inProgress - completed + started);
    todo = Math.max(0, todo - started);
  }
  return points;
};

const cycleTimeByType: CycleTimeByTypeItem[] = [
  { type: 'Feature', avgDays: 4.2 },
  { type: 'Bug', avgDays: 1.8 },
  { type: 'Improvement', avgDays: 3.1 },
  { type: 'Tech Debt', avgDays: 2.5 },
];

const timeInStatus: TimeInStatusRow[] = [
  { squad: 'Platform Core', backlog: 0.5, todo: 0.8, inProgress: 1.5, review: 0.3, done: 0 },
  { squad: 'Growth Engine', backlog: 1.2, todo: 1.5, inProgress: 2.8, review: 0.9, done: 0 },
  { squad: 'Payments', backlog: 0.3, todo: 0.6, inProgress: 1.2, review: 0.2, done: 0 },
  { squad: 'Mobile Squad', backlog: 2.1, todo: 2.3, inProgress: 3.5, review: 1.4, done: 0 },
  { squad: 'Data & ML', backlog: 0.8, todo: 1.1, inProgress: 2.2, review: 0.6, done: 0 },
];

const generatePriorityEvolution = (): PriorityEvolutionPoint[] => {
  const pts: PriorityEvolutionPoint[] = [];
  let high = 35, medium = 60, low = 45;
  for (let day = 0; day <= 10; day++) {
    pts.push({ day, high, medium, low });
    high = Math.max(0, high + Math.round((Math.random() - 0.5) * 4));
    medium = Math.max(0, medium + Math.round((Math.random() - 0.5) * 5));
    low = Math.max(0, low + Math.round((Math.random() - 0.5) * 3));
  }
  return pts;
};

const personDistribution: Record<string, PersonDistributionItem[]> = {
  'squad-1': [
    { name: 'Alice K.', done: 12, inProgress: 1, todo: 0 },
    { name: 'Bob M.', done: 10, inProgress: 1, todo: 0 },
    { name: 'Carol S.', done: 8, inProgress: 0, todo: 1 },
    { name: 'Dan P.', done: 4, inProgress: 0, todo: 0 },
  ],
  'squad-2': [
    { name: 'Eve R.', done: 8, inProgress: 2, todo: 1 },
    { name: 'Frank T.', done: 7, inProgress: 1, todo: 2 },
    { name: 'Grace L.', done: 4, inProgress: 2, todo: 1 },
    { name: 'Hank W.', done: 3, inProgress: 0, todo: 1 },
  ],
  'squad-3': [
    { name: 'Ivy N.', done: 10, inProgress: 1, todo: 0 },
    { name: 'Jack O.', done: 9, inProgress: 2, todo: 0 },
    { name: 'Kim B.', done: 9, inProgress: 0, todo: 0 },
  ],
  'squad-4': [
    { name: 'Leo C.', done: 4, inProgress: 2, todo: 3 },
    { name: 'Mia D.', done: 3, inProgress: 1, todo: 2 },
    { name: 'Nick E.', done: 3, inProgress: 1, todo: 2 },
    { name: 'Olivia F.', done: 2, inProgress: 0, todo: 2 },
  ],
  'squad-5': [
    { name: 'Pat G.', done: 5, inProgress: 1, todo: 0 },
    { name: 'Quinn H.', done: 4, inProgress: 1, todo: 1 },
    { name: 'Rita I.', done: 3, inProgress: 0, todo: 0 },
  ],
};

const mockTasks: TaskItem[] = [
  { id: 't1', key: 'PLAT-201', summary: 'Implement OAuth2 refresh token rotation', squad: 'Platform Core', assignee: 'Alice K.', status: 'Done', priority: 'High', storyPoints: 5, type: 'Feature' },
  { id: 't2', key: 'PLAT-202', summary: 'Fix rate limiter edge case', squad: 'Platform Core', assignee: 'Bob M.', status: 'Done', priority: 'Medium', storyPoints: 3, type: 'Bug' },
  { id: 't3', key: 'PLAT-203', summary: 'Database connection pooling optimization', squad: 'Platform Core', assignee: 'Carol S.', status: 'In Progress', priority: 'High', storyPoints: 5, type: 'Improvement' },
  { id: 't4', key: 'GRW-110', summary: 'A/B testing framework integration', squad: 'Growth Engine', assignee: 'Eve R.', status: 'In Progress', priority: 'High', storyPoints: 8, type: 'Feature' },
  { id: 't5', key: 'GRW-111', summary: 'Email campaign performance tracker', squad: 'Growth Engine', assignee: 'Frank T.', status: 'Done', priority: 'Medium', storyPoints: 5, type: 'Feature' },
  { id: 't6', key: 'GRW-112', summary: 'Landing page conversion fix', squad: 'Growth Engine', assignee: 'Grace L.', status: 'To Do', priority: 'High', storyPoints: 3, type: 'Bug' },
  { id: 't7', key: 'PAY-305', summary: 'Stripe webhook retry mechanism', squad: 'Payments', assignee: 'Ivy N.', status: 'Done', priority: 'High', storyPoints: 5, type: 'Feature' },
  { id: 't8', key: 'PAY-306', summary: 'Invoice PDF generation', squad: 'Payments', assignee: 'Jack O.', status: 'Done', priority: 'Medium', storyPoints: 3, type: 'Feature' },
  { id: 't9', key: 'PAY-307', summary: 'Payment reconciliation report', squad: 'Payments', assignee: 'Kim B.', status: 'In Progress', priority: 'Medium', storyPoints: 5, type: 'Improvement' },
  { id: 't10', key: 'MOB-401', summary: 'Push notification deep linking', squad: 'Mobile Squad', assignee: 'Leo C.', status: 'To Do', priority: 'High', storyPoints: 5, type: 'Feature' },
  { id: 't11', key: 'MOB-402', summary: 'Fix offline sync conflict resolution', squad: 'Mobile Squad', assignee: 'Mia D.', status: 'In Progress', priority: 'High', storyPoints: 3, type: 'Bug' },
  { id: 't12', key: 'MOB-403', summary: 'App crash on Android 14 camera', squad: 'Mobile Squad', assignee: 'Nick E.', status: 'To Do', priority: 'High', storyPoints: 3, type: 'Bug' },
  { id: 't13', key: 'MOB-404', summary: 'Biometric auth fallback flow', squad: 'Mobile Squad', assignee: 'Olivia F.', status: 'To Do', priority: 'Medium', storyPoints: 5, type: 'Feature' },
  { id: 't14', key: 'DML-501', summary: 'ML pipeline migration to Airflow', squad: 'Data & ML', assignee: 'Pat G.', status: 'In Progress', priority: 'High', storyPoints: 5, type: 'Tech Debt' },
  { id: 't15', key: 'DML-502', summary: 'Feature store caching layer', squad: 'Data & ML', assignee: 'Quinn H.', status: 'Done', priority: 'Medium', storyPoints: 3, type: 'Feature' },
  { id: 't16', key: 'DML-503', summary: 'Model monitoring dashboard', squad: 'Data & ML', assignee: 'Rita I.', status: 'Done', priority: 'Low', storyPoints: 2, type: 'Improvement' },
  { id: 't17', key: 'PLAT-204', summary: 'Migrate legacy auth endpoints', squad: 'Platform Core', assignee: 'Dan P.', status: 'Done', priority: 'Medium', storyPoints: 3, type: 'Tech Debt' },
  { id: 't18', key: 'GRW-113', summary: 'Referral tracking pixel', squad: 'Growth Engine', assignee: 'Hank W.', status: 'Done', priority: 'Low', storyPoints: 2, type: 'Feature' },
  { id: 't19', key: 'PAY-308', summary: 'Multi-currency support', squad: 'Payments', assignee: 'Ivy N.', status: 'Done', priority: 'High', storyPoints: 8, type: 'Feature' },
  { id: 't20', key: 'MOB-405', summary: 'Dark mode color contrast fixes', squad: 'Mobile Squad', assignee: 'Leo C.', status: 'In Progress', priority: 'Low', storyPoints: 2, type: 'Bug' },
];

export const mockDashboardData: DashboardData = {
  sprint: {
    id: 'sprint-47',
    name: 'Sprint #47',
    number: 47,
    startDate: '2026-02-10',
    endDate: '2026-02-24',
    totalStoryPoints: 140,
    completedStoryPoints: 108,
  },
  squads: [
    {
      id: 'squad-1',
      name: 'Platform Core',
      health: 'green',
      storyPoints: { completed: 34, total: 37 },
      completionPercentage: 92,
      velocity: 37,
      avgVelocity: 35,
      burndown: generateBurndown(37, 1.1),
      taskDistribution: { done: 34, inProgress: 2, todo: 1 },
      blockers: 0,
      predictability: 94,
      velocityHistory: generateVelocityHistory(35),
      capacity: 40,
      cycleTime: 2.1,
    },
    {
      id: 'squad-2',
      name: 'Growth Engine',
      health: 'yellow',
      storyPoints: { completed: 22, total: 32 },
      completionPercentage: 69,
      velocity: 32,
      avgVelocity: 30,
      burndown: generateBurndown(32, 0.85),
      taskDistribution: { done: 22, inProgress: 5, todo: 5 },
      blockers: 2,
      predictability: 72,
      velocityHistory: generateVelocityHistory(30),
      capacity: 35,
      cycleTime: 3.4,
    },
    {
      id: 'squad-3',
      name: 'Payments',
      health: 'green',
      storyPoints: { completed: 28, total: 31 },
      completionPercentage: 90,
      velocity: 31,
      avgVelocity: 29,
      burndown: generateBurndown(31, 1.05),
      taskDistribution: { done: 28, inProgress: 3, todo: 0 },
      blockers: 0,
      predictability: 91,
      velocityHistory: generateVelocityHistory(29),
      capacity: 32,
      cycleTime: 1.8,
    },
    {
      id: 'squad-4',
      name: 'Mobile Squad',
      health: 'red',
      storyPoints: { completed: 12, total: 25 },
      completionPercentage: 48,
      velocity: 25,
      avgVelocity: 23,
      burndown: generateBurndown(25, 0.6),
      taskDistribution: { done: 12, inProgress: 4, todo: 9 },
      blockers: 3,
      predictability: 58,
      velocityHistory: generateVelocityHistory(23),
      capacity: 28,
      cycleTime: 4.7,
    },
    {
      id: 'squad-5',
      name: 'Data & ML',
      health: 'yellow',
      storyPoints: { completed: 12, total: 15 },
      completionPercentage: 80,
      velocity: 15,
      avgVelocity: 14,
      burndown: generateBurndown(15, 0.9),
      taskDistribution: { done: 12, inProgress: 2, todo: 1 },
      blockers: 1,
      predictability: 78,
      velocityHistory: generateVelocityHistory(14),
      capacity: 16,
      cycleTime: 3.1,
    },
  ],
  alerts: [
    { id: 'alert-1', type: 'critical', squad: 'Mobile Squad', message: '3 blockers affecting 9 SP — dependency on Platform Core API', storyPointsAffected: 9 },
    { id: 'alert-2', type: 'critical', squad: 'Mobile Squad', message: 'Sprint completion projected at 52% — significantly below target', storyPointsAffected: 13 },
    { id: 'alert-3', type: 'warning', squad: 'Growth Engine', message: '2 blockers on A/B testing infrastructure — 5 SP at risk', storyPointsAffected: 5 },
    { id: 'alert-4', type: 'warning', squad: 'Data & ML', message: 'Pipeline migration delayed — 1 blocker affecting 3 SP', storyPointsAffected: 3 },
  ],
  createdVsCompleted: generateCreatedVsCompleted(),
  cumulativeFlow: generateCumulativeFlow(),
  cycleTimeByType,
  timeInStatus,
  priorityEvolution: generatePriorityEvolution(),
  personDistribution,
  tasks: mockTasks,
  workItemAge: [],
  availableSprints: [
    {
      id: 'sprint-47',
      name: 'Sprint #47',
      number: 47,
      startDate: '2026-02-10',
      endDate: '2026-02-24',
      totalStoryPoints: 140,
      completedStoryPoints: 108,
      goal: 'Current sprint',
    },
  ],
  availableAssignees: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams'],
  availableIssueTypes: ['Bug', 'Story', 'Task', 'Epic'],
};
