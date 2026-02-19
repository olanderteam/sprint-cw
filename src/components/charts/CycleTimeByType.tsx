import { CycleTimeByTypeItem } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  data: CycleTimeByTypeItem[];
}

const CycleTimeByType = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Cycle Time by Type</h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barSize={14}>
          <CartesianGrid stroke="hsl(var(--chart-grid))" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="d" />
          <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} formatter={(v: number) => [`${v} days`, 'Avg Cycle Time']} />
          <Bar dataKey="avgDays" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CycleTimeByType;
