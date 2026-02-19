import { CreatedVsCompletedPoint } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';

interface Props {
  data: CreatedVsCompletedPoint[];
}

const CreatedVsCompleted = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Created vs Completed</h3>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={1}>
          <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={25} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="created" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} name="Created" />
          <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CreatedVsCompleted;
