import { CumulativeFlowPoint } from '@/types/dashboard';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: CumulativeFlowPoint[];
}

const CumulativeFlowDiagram = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Cumulative Flow</h3>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} stackOffset="none">
          <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} label={{ value: 'Sprint Day', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} label={{ value: 'SP', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
          <Area type="monotone" dataKey="done" stackId="1" fill="hsl(var(--health-green))" fillOpacity={0.6} stroke="hsl(var(--health-green))" strokeWidth={1} name="Done" />
          <Area type="monotone" dataKey="inProgress" stackId="1" fill="hsl(var(--primary))" fillOpacity={0.5} stroke="hsl(var(--primary))" strokeWidth={1} name="In Progress" />
          <Area type="monotone" dataKey="todo" stackId="1" fill="hsl(var(--muted))" fillOpacity={0.8} stroke="hsl(var(--muted-foreground))" strokeWidth={1} name="To Do" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CumulativeFlowDiagram;
