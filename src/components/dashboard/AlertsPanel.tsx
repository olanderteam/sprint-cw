import { Alert } from '@/types/dashboard';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Alertas & Blockers</h3>
      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-xs ${
              alert.type === 'critical' ? 'badge-critical' : 'badge-warning'
            }`}
          >
            {alert.type === 'critical' ? (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-semibold">{alert.squad}</span>
              <span className="mx-1.5 text-current/60">·</span>
              <span>{alert.message}</span>
            </div>
            <span className="flex-shrink-0 font-semibold">{alert.storyPointsAffected} SP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
