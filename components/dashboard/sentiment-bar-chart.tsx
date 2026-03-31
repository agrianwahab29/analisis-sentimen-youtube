"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface SentimentBarChartProps {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

type SentimentBarDatum = { name: string; value: number; color: string };

function SentimentBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: SentimentBarDatum }>;
}) {
  const datum = payload?.[0]?.payload;
  if (active && datum) {
    return (
      <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-900">{datum.name}</p>
        <p className="text-2xl font-bold" style={{ color: datum.color }}>
          {datum.value} komentar
        </p>
      </div>
    );
  }
  return null;
}

export function SentimentBarChart({ data }: SentimentBarChartProps) {
  const chartData: SentimentBarDatum[] = [
    { name: "Positif", value: data.positive, color: "#10B981" },
    { name: "Negatif", value: data.negative, color: "#F43F5E" },
    { name: "Netral", value: data.neutral, color: "#94A3B8" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl border border-slate-200 bg-white p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Jumlah Komentar</h3>
          <p className="text-sm text-slate-500">Perbandingan jumlah per sentimen</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip content={<SentimentBarTooltip />} cursor={{ fill: '#F1F5F9' }} />
            
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
