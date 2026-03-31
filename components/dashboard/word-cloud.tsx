"use client";

import { motion } from "framer-motion";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloud({ words }: WordCloudProps) {
  // Calculate font size based on value (min 14px, max 48px)
  const maxValue = Math.max(...words.map(w => w.value));
  const minValue = Math.min(...words.map(w => w.value));
  
  const getFontSize = (value: number) => {
    const minSize = 14;
    const maxSize = 48;
    return minSize + ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
  };

  // Colors for words
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#F43F5E", // Rose
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#6366F1", // Indigo
  ];

  const getColor = (index: number) => colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 8l4-4M7 20H5.5a2.5 2.5 0 01-2.5-2.5v-15a2.5 2.5 0 012.5-2.5h13a2.5 2.5 0 012.5 2.5v15a2.5 2.5 0 01-2.5 2.5H7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Kata Populer</h3>
          <p className="text-sm text-slate-500">Kata yang paling sering muncul dalam komentar</p>
        </div>
      </div>

      <div className="min-h-[300px] flex flex-wrap items-center justify-center gap-3 p-4">
        {words.map((word, index) => (
          <motion.span
            key={word.text}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
            className="cursor-pointer transition-all duration-200"
            style={{
              fontSize: `${getFontSize(word.value)}px`,
              color: getColor(index),
              fontWeight: word.value > (maxValue + minValue) / 2 ? 700 : 500,
            }}
          >
            {word.text}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
