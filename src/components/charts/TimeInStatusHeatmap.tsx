import { TimeInStatusRow } from '@/types/dashboard';

interface Props {
  data: TimeInStatusRow[];
}

const statuses = ['backlog', 'todo', 'inProgress', 'review'] as const;
const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  inProgress: 'In Progress',
  review: 'Review',
};

const getIntensity = (value: number): string => {
  if (value <= 0.5) return 'bg-primary/10';
  if (value <= 1.0) return 'bg-primary/20';
  if (value <= 2.0) return 'bg-primary/35';
  if (value <= 3.0) return 'bg-primary/55';
  return 'bg-primary/75';
};

const TimeInStatusHeatmap = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Time in Status (avg days)</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="pb-2 text-left font-medium text-muted-foreground">Squad</th>
            {statuses.map(s => (
              <th key={s} className="pb-2 text-center font-medium text-muted-foreground">{statusLabels[s]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.squad}>
              <td className="py-1.5 pr-3 font-medium text-foreground whitespace-nowrap">{row.squad}</td>
              {statuses.map(s => (
                <td key={s} className="py-1.5 px-1">
                  <div className={`mx-auto flex h-8 w-14 items-center justify-center rounded ${getIntensity(row[s])}`}>
                    <span className="font-semibold text-foreground">{row[s]}d</span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TimeInStatusHeatmap;
