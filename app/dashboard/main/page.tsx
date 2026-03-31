import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SentimentCard } from "@/components/dashboard/sentiment-card";
import { AnalysisInput } from "@/components/dashboard/analysis-input";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Analysis Input */}
        <AnalysisInput />

        {/* Sentiment Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <SentimentCard
            type="positive"
            count={1247}
            percentage={62.3}
            trend={12}
          />
          <SentimentCard
            type="negative"
            count={423}
            percentage={21.1}
            trend={-5}
          />
          <SentimentCard
            type="neutral"
            count={330}
            percentage={16.6}
            trend={3}
          />
        </div>

        {/* Placeholder for Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400">Pie Chart akan ditampilkan di sini</p>
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 card-shadow h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400">Bar Chart akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
