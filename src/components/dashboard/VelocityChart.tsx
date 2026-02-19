import { SquadData } from '@/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface VelocityChartProps {
  squads: SquadData[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--health-green))',
  'hsl(var(--health-yellow))',
  'hsl(var(--health-red))',
  'hsl(var(--muted-foreground))',
];

const VelocityChart = ({ squads }: VelocityChartProps) => {
  // Merge velocity histories into unified data
  const sprints = squads[0]?.velocityHistory.map(v => v.sprint) ?? [];
  const chartData = sprints.map(sprint => {
    const point: Record<string, string | number> = { sprint };
    squads.forEach(squad => {
      const match = squad.velocityHistory.find(v => v.sprint === sprint);
      point[squad.name] = match?.points ?? 0;
    });
    return point;
  });

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Velocity Comparison</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="sprint"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
            />
            {squads.map((squad, i) => (
              <Line
                key={squad.id}
                type="monotone"
                dataKey={squad.name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={{ r: 2.5, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VelocityChart;
