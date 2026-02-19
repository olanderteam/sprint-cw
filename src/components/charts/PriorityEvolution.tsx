import { PriorityEvolutionPoint } from '@/types/dashboard';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  data: PriorityEvolutionPoint[];
}

const PriorityEvolution = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Priority Evolution</h3>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: 'Sprint Day', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="high" stackId="1" fill="hsl(var(--health-red))" fillOpacity={0.5} stroke="hsl(var(--health-red))" strokeWidth={1} name="High" />
          <Area type="monotone" dataKey="medium" stackId="1" fill="hsl(var(--health-yellow))" fillOpacity={0.5} stroke="hsl(var(--health-yellow))" strokeWidth={1} name="Medium" />
          <Area type="monotone" dataKey="low" stackId="1" fill="hsl(var(--health-green))" fillOpacity={0.5} stroke="hsl(var(--health-green))" strokeWidth={1} name="Low" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default PriorityEvolution;
