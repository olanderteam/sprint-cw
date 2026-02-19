import { SquadData, HealthStatus } from '@/types/dashboard';
import BurndownSparkline from './BurndownSparkline';
import { AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';

interface SquadCardProps {
  squad: SquadData;
  onViewDetails: (squad: SquadData) => void;
}

const healthDot: Record<HealthStatus, string> = {
  green: 'bg-health-green',
  yellow: 'bg-health-yellow',
  red: 'bg-health-red',
};

const healthLabel: Record<HealthStatus, string> = {
  green: 'On Track',
  yellow: 'At Risk',
  red: 'Critical',
};

const SquadCard = ({ squad, onViewDetails }: SquadCardProps) => {
  // Use task distribution total if story points total is 0
  const barTotal = squad.storyPoints.total > 0 
    ? squad.storyPoints.total 
    : (squad.taskDistribution.done + squad.taskDistribution.inProgress + squad.taskDistribution.todo);
  
  const doneW = barTotal > 0 ? (squad.taskDistribution.done / barTotal) * 100 : 0;
  const inProgressW = barTotal > 0 ? (squad.taskDistribution.inProgress / barTotal) * 100 : 0;

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
          {squad.completionPercentage}%
        </span>
        <span className="text-xs text-muted-foreground">
          {squad.storyPoints.completed}/{squad.storyPoints.total} SP
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
        <span>Done {squad.taskDistribution.done}</span>
        <span>In Progress {squad.taskDistribution.inProgress}</span>
        <span>To Do {squad.taskDistribution.todo}</span>
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
          <p className="text-[10px] text-muted-foreground">Velocity</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <TrendingUp className="h-3 w-3 text-primary" />
            {squad.velocity} SP
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Cycle Time</p>
          <p className="text-xs font-semibold text-foreground">{squad.cycleTime}d</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Blockers</p>
          <p className={`flex items-center gap-1 text-xs font-semibold ${squad.blockers > 0 ? 'text-health-red' : 'text-foreground'}`}>
            {squad.blockers > 0 && <AlertTriangle className="h-3 w-3" />}
            {squad.blockers}
          </p>
        </div>
      </div>

      {/* View Details */}
      <button
        onClick={() => onViewDetails(squad)}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        View Details <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default SquadCard;
