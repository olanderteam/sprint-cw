import { SquadData, HealthStatus, PersonDistributionItem, TaskItem, Alert, SprintInfo } from '@/types/dashboard';
import { X, TrendingUp, AlertTriangle, Target, Clock, BarChart3, ChevronDown } from 'lucide-react';
import BurndownSparkline from './BurndownSparkline';
import DistributionByPerson from '@/components/charts/DistributionByPerson';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useState } from 'react';

interface Props {
  squad: SquadData;
  personDistribution: PersonDistributionItem[];
  tasks: TaskItem[];
  alerts: Alert[];
  availableSprints?: SprintInfo[];
  onClose: () => void;
}

const healthDot: Record<HealthStatus, string> = {
  green: 'bg-health-green',
  yellow: 'bg-health-yellow',
  red: 'bg-health-red',
};

const healthLabel: Record<HealthStatus, string> = {
  green: 'No Prazo',
  yellow: 'Em Risco',
  red: 'Crítico',
};

const statusBadge: Record<string, string> = {
  Done: 'badge-success',
  'In Progress': 'bg-primary/10 text-primary',
  'In Review': 'badge-warning',
  'To Do': 'bg-muted text-muted-foreground',
};

const SquadDetailPanel = ({ squad, personDistribution, tasks, alerts, availableSprints = [], onClose }: Props) => {
  // Filter sprints to only show sprints from this squad's board
  // Match by boardId OR projectKey (projectKey is more reliable for matching)
  const squadSprints = availableSprints.filter(sprint => {
    // If squad has projectKey, match by projectKey (most reliable)
    if (squad.projectKey && sprint.projectKey) {
      return sprint.projectKey === squad.projectKey;
    }
    // Fallback to boardId match
    if (squad.boardId && sprint.boardId) {
      return sprint.boardId === squad.boardId;
    }
    // If no match criteria, don't include
    return false;
  });
  
  const [selectedSprint, setSelectedSprint] = useState<string>(squadSprints[0]?.name || '');
  const [isSprintDropdownOpen, setIsSprintDropdownOpen] = useState(false);

  const squadTasks = tasks.filter(t => t.squad === squad.name && (!selectedSprint || t.sprint === selectedSprint));
  const squadAlerts = alerts.filter(a => a.squad === squad.name);

  // Calculate task distribution based on filtered tasks
  const filteredDistribution = squadTasks.reduce((acc, task) => {
    const sp = task.storyPoints || 0;
    if (task.status === 'Done') {
      acc.done += sp;
    } else if (task.status === 'In Progress' || task.status === 'In Review') {
      acc.inProgress += sp;
    } else {
      acc.todo += sp;
    }
    return acc;
  }, { done: 0, inProgress: 0, todo: 0 });

  const totalFilteredSP = filteredDistribution.done + filteredDistribution.inProgress + filteredDistribution.todo;
  const filteredCompletionPercentage = totalFilteredSP > 0 ? Math.round((filteredDistribution.done / totalFilteredSP) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-background shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${healthDot[squad.health]}`} />
              <span className="text-xs font-medium text-muted-foreground">{healthLabel[squad.health]}</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">{squad.name}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Sprint Selector */}
            {squadSprints.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsSprintDropdownOpen(!isSprintDropdownOpen)}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span>{selectedSprint || 'Select Sprint'}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {isSprintDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSprintDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 max-h-60 w-48 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                      {squadSprints.map(sprint => (
                        <button
                          key={sprint.id}
                          onClick={() => {
                            setSelectedSprint(sprint.name);
                            setIsSprintDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-accent ${
                            selectedSprint === sprint.name ? 'bg-accent font-medium' : ''
                          }`}
                        >
                          {sprint.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Target, label: 'Completion', value: `${filteredCompletionPercentage}%`, sub: `${filteredDistribution.done}/${totalFilteredSP} SP` },
              { icon: TrendingUp, label: 'Velocity', value: `${filteredDistribution.inProgress} SP`, sub: 'em progresso' },
              { icon: Clock, label: 'Cycle Time', value: `${filteredDistribution.done} SP`, sub: 'concluídos' },
              { icon: BarChart3, label: 'Predictability', value: `${squad.predictability}%`, sub: 'commit vs entrega' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <kpi.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{kpi.label}</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Task distribution bar */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">Distribuição de Tasks</p>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-accent">
              <div className="bg-health-green transition-all" style={{ width: `${totalFilteredSP > 0 ? (filteredDistribution.done / totalFilteredSP) * 100 : 0}%` }} />
              <div className="bg-primary transition-all" style={{ width: `${totalFilteredSP > 0 ? (filteredDistribution.inProgress / totalFilteredSP) * 100 : 0}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Concluído {filteredDistribution.done} SP</span>
              <span>Em Progresso {filteredDistribution.inProgress} SP</span>
              <span>Pendente {filteredDistribution.todo} SP</span>
            </div>
          </div>

          {/* Burndown */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">Gráfico de Burndown</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={squad.burndown}>
                  <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="ideal" stroke="hsl(var(--spark-ideal))" strokeWidth={1} strokeDasharray="4 3" dot={false} name="Ideal" />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--spark-actual))" strokeWidth={2} dot={{ r: 2 }} name="Real" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Velocity History */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">Histórico de Velocity</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={squad.velocityHistory}>
                  <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} name="SP" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workload by Person */}
          {personDistribution.length > 0 && (
            <DistributionByPerson data={personDistribution} />
          )}

          {/* Squad Alerts */}
          {squadAlerts.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-2 text-xs font-semibold text-foreground">Blockers & Alertas</p>
              <div className="space-y-2">
                {squadAlerts.map(alert => (
                  <div key={alert.id} className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${alert.type === 'critical' ? 'badge-critical' : 'badge-warning'}`}>
                    <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                    <span className="flex-1">{alert.message}</span>
                    <span className="flex-shrink-0 font-semibold">{alert.storyPointsAffected} SP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Squad Tasks */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold text-foreground">Tasks ({squadTasks.length})</p>
            <div className="space-y-1.5">
              {squadTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 rounded-md px-2 py-1.5 text-xs hover:bg-accent/50">
                  <span className="font-mono font-medium text-primary">{t.key}</span>
                  <span className="flex-1 truncate text-foreground">{t.summary}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge[t.status]}`}>{t.status}</span>
                  <span className="font-semibold text-foreground">{t.storyPoints} SP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquadDetailPanel;
