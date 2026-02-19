import { BurndownPoint } from '@/types/dashboard';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface BurndownSparklineProps {
  data: BurndownPoint[];
}

const BurndownSparkline = ({ data }: BurndownSparklineProps) => {
  const max = Math.max(...data.map(d => Math.max(d.ideal, d.actual)));

  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[0, max]} hide />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="hsl(var(--spark-ideal))"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--spark-actual))"
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BurndownSparkline;
