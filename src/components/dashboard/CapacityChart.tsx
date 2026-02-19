import { SquadData } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface CapacityChartProps {
  squads: SquadData[];
}

const CapacityChart = ({ squads }: CapacityChartProps) => {
  const data = squads.map(s => ({
    name: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
    committed: s.storyPoints.total,
    capacity: s.capacity,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Capacity vs Committed</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={25}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="capacity" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} name="Capacity" />
            <Bar dataKey="committed" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Committed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CapacityChart;
