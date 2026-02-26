import { SquadData, HealthStatus, TaskItem } from '@/types/dashboard';
import BurndownSparkline from './BurndownSparkline';
import { ArrowRight } from 'lucide-react';

interface SquadCardProps {
  squad: SquadData;
  filteredTasks: TaskItem[];
  onViewDetails: (squad: SquadData) => void;
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

const SquadCard = ({ squad, filteredTasks, onViewDetails }: SquadCardProps) => {
  // Calculate metrics based on filtered tasks for this squad
  const squadFilteredTasks = filteredTasks.filter(t => t.squad === squad.name);
  
  const calculatedDistribution = squadFilteredTasks.reduce((acc, task) => {
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

  const totalSP = calculatedDistribution.done + calculatedDistribution.inProgress + calculatedDistribution.todo;
  const completionPercentage = totalSP > 0 ? Math.round((calculatedDistribution.done / totalSP) * 100) : 0;

  // Use calculated distribution for the bar
  const barTotal = totalSP > 0 ? totalSP : 1;
  const doneW = (calculatedDistribution.done / barTotal) * 100;
  const inProgressW = (calculatedDistribution.inProgress / barTotal) * 100;

  return (
    <div className="group rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{squad.name}</h3>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${healthDot[squad.health]}`} />
          <span className="text-[11px] font-medium text-muted-foreground">{healthLabel[squad.health]}</span>
        </div>
      </div>

      {/* Big number */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          {completionPercentage}%
        </span>
        <span className="text-xs text-muted-foreground">
          {calculatedDistribution.done}/{totalSP} SP
        </span>
      </div>

      {/* Task distribution bar */}
      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-accent">
        {doneW > 0 && <div className="bg-health-green transition-all" style={{ width: `${doneW}%` }} />}
        {inProgressW > 0 && <div className="bg-primary transition-all" style={{ width: `${inProgressW}%` }} />}
        {/* Show full gray bar if no progress */}
        {doneW === 0 && inProgressW === 0 && <div className="bg-muted w-full" />}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>Done {calculatedDistribution.done}</span>
        <span>In Progress {calculatedDistribution.inProgress}</span>
        <span>To Do {calculatedDistribution.todo}</span>
      </div>

      {/* Goal */}
      {squad.goal && (
        <div className="mt-4 rounded bg-accent/50 p-2">
          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sprint Goal</p>
          <p className="text-xs italic text-foreground">"{squad.goal}"</p>
        </div>
      )}

      {/* Burndown sparkline */}
      <div className="mt-4">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Burndown</p>
        <BurndownSparkline data={squad.burndown} />
      </div>

      {/* Bottom stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Concluídos</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-health-green">
            {calculatedDistribution.done} SP
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Em Progresso</p>
          <p className="text-xs font-semibold text-primary">
            {calculatedDistribution.inProgress} SP
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Pendentes</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {calculatedDistribution.todo} SP
          </p>
        </div>
      </div>

      {/* View Details */}
      <button
        onClick={() => onViewDetails(squad)}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Ver Detalhes <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default SquadCard;
