import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface SprintGoalPanelProps {
  goal: string;
}

const SprintGoalPanel = ({ goal }: SprintGoalPanelProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Sprint Goal</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-medium">{goal || "No goal set for this sprint."}</div>
      </CardContent>
    </Card>
  );
};

export default SprintGoalPanel;
