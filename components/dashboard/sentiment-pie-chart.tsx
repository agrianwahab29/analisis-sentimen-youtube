"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface SentimentPieChartProps {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

type SentimentPieDatum = { name: string; value: number; color: string };

function SentimentPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: SentimentPieDatum }>;
}) {
  const item = payload?.[0];
  const color = item?.payload?.color;
  const name = item?.name ?? item?.payload?.name;
  const value = item?.value ?? item?.payload?.value;

  if (active && name && typeof value === "number" && color) {
    return (
      <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-900">{name}</p>
        <p className="text-2xl font-bold" style={{ color }}>
          {value} komentar
        </p>
      </div>
    );
  }

  return null;
}

export function SentimentPieChart({ data }: SentimentPieChartProps) {
  const chartData: SentimentPieDatum[] = [
    { name: "Positif", value: data.positive, color: "#10B981" },
    { name: "Negatif", value: data.negative, color: "#F43F5E" },
    { name: "Netral", value: data.neutral, color: "#94A3B8" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 font-heading">Distribusi Sentimen</h3>
          <p className="text-xs md:text-sm text-slate-500">Persentase sentimen komentar</p>
        </div>
      </div>

      <div className="h-56 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<SentimentPieTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => <span className="text-sm text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
