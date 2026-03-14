import { Progress } from "@/components/ui/Progress";
import { Card } from "@/components/ui/Card";

export function MetricCard({ title, value, progress }: { title: string; value: string; progress: number }) {
  return (
    <Card className="space-y-2.5 p-4">
      <div>
        <p className="text-[0.88rem] text-slate-400">{title}</p>
        <p className="mt-1 text-[1.35rem] font-semibold text-slate-100">{value}</p>
      </div>
      <Progress value={progress} />
    </Card>
  );
}
