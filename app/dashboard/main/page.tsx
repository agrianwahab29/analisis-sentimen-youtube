import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalysisInput } from "@/components/dashboard/analysis-input";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Analysis Input */}
        <AnalysisInput />

        {/* Empty state - no hardcoded data */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum ada analisis</h3>
          <p className="mt-1 text-sm text-slate-500">
            Masukkan URL video YouTube di atas untuk mulai menganalisis sentimen komentar
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
