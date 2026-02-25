import { SprintInfo } from '@/types/dashboard';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  sprint: SprintInfo;
  overallPercentage: number;
  criticalAlerts: number;
  onRefresh: () => void;
}

const DashboardHeader = ({ sprint, overallPercentage, criticalAlerts, onRefresh }: DashboardHeaderProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard de Acompanhamento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-foreground">{overallPercentage}%</span>
          <span className="text-sm text-muted-foreground">
            {sprint.completedStoryPoints}/{sprint.totalStoryPoints} SP
          </span>
        </div>

        {criticalAlerts > 0 && (
          <div className="badge-critical flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-subtle rounded-full bg-health-red" />
            {criticalAlerts} Alerta{criticalAlerts > 1 ? 's' : ''} Crítico{criticalAlerts > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
