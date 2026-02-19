import { PersonDistributionItem } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  data: PersonDistributionItem[];
}

const DistributionByPerson = ({ data }: Props) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">Workload by Person</h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barSize={12}>
          <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={65} />
          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }} />
          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="done" stackId="a" fill="hsl(var(--health-green))" name="Done" radius={[0, 0, 0, 0]} />
          <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--primary))" name="In Progress" />
          <Bar dataKey="todo" stackId="a" fill="hsl(var(--muted))" name="To Do" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default DistributionByPerson;
