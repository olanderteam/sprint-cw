import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts";

interface WorkItemAgeProps {
    data: {
        key: string;
        summary: string;
        age: number; // days
        storyPoints: number;
        status: string;
        assignee: string;
    }[];
}

const WorkItemAge = ({ data }: WorkItemAgeProps) => {
    const sortedData = [...data].sort((a, b) => b.age - a.age);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Work Item Age (In Progress)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis
                            type="number"
                            dataKey="age"
                            name="Age"
                            unit=" days"
                            label={{ value: 'Days in Progress', position: 'bottom', offset: 0 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="key"
                            name="Issue"
                            width={80}
                            tick={{ fontSize: 10 }}
                        />
                        <ZAxis type="number" dataKey="storyPoints" range={[50, 400]} name="Story Points" />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Issue
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {data.key}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Age
                                                    </span>
                                                    <span className="font-bold">
                                                        {data.age} days
                                                    </span>
                                                </div>
                                                <div className="flex flex-col col-span-2">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Summary
                                                    </span>
                                                    <span className="font-medium text-xs">
                                                        {data.summary}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Assignee
                                                    </span>
                                                    <span className="font-medium text-xs">
                                                        {data.assignee}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Points
                                                    </span>
                                                    <span className="font-medium text-xs">
                                                        {data.storyPoints}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter data={sortedData} fill="#8884d8">
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.age > 10 ? '#ef4444' : entry.age > 5 ? '#eab308' : '#22c55e'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default WorkItemAge;
