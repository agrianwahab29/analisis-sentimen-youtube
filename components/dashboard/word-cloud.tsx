"use client";

import { motion } from "framer-motion";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloud({ words }: WordCloudProps) {
  // Handle edge case: no words or very few words (AGR-12)
  if (!words || words.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 card-shadow"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 8l4-4M7 20H5.5a2.5 2.5 0 01-2.5-2.5v-15a2.5 2.5 0 012.5-2.5h13a2.5 2.5 0 012.5 2.5v15a2.5 2.5 0 01-2.5 2.5H7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 font-heading">Kata Populer</h3>
            <p className="text-sm text-slate-500">Tidak cukup data untuk word cloud</p>
          </div>
        </div>
        <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 mb-1">Tidak ada kata yang cukup sering muncul</p>
          <p className="text-xs text-slate-400">Word cloud membutuhkan minimal beberapa komentar dengan kata berulang</p>
        </div>
      </motion.div>
    );
  }

  // Handle edge case: very few words (< 5) - show simplified view
  if (words.length < 5) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 card-shadow"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 8l4-4M7 20H5.5a2.5 2.5 0 01-2.5-2.5v-15a2.5 2.5 0 012.5-2.5h13a2.5 2.5 0 012.5 2.5v15a2.5 2.5 0 01-2.5 2.5H7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 font-heading">Kata Populer</h3>
            <p className="text-sm text-slate-500">Data terbatas - hanya {words.length} kata unik</p>
          </div>
        </div>
        <div className="min-h-[200px] flex flex-wrap items-center justify-center gap-4 p-4">
          {words.map((word, index) => (
            <div
              key={word.text}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <span className="text-lg font-semibold text-slate-900">{word.text}</span>
              <span className="text-xs text-slate-500">{word.value}x muncul</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Normal word cloud for sufficient data
  // Calculate font size based on value (mobile: min 12px, max 32px; desktop: min 14px, max 48px)
  const maxValue = Math.max(...words.map(w => w.value));
  const minValue = Math.min(...words.map(w => w.value));
  
  const getFontSize = (value: number, isMobile = false) => {
    const minSize = isMobile ? 12 : 14;
    const maxSize = isMobile ? 28 : 40;
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
      className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 8l4-4M7 20H5.5a2.5 2.5 0 01-2.5-2.5v-15a2.5 2.5 0 012.5-2.5h13a2.5 2.5 0 012.5 2.5v15a2.5 2.5 0 01-2.5 2.5H7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-slate-900 font-heading">Kata Populer</h3>
          <p className="text-xs md:text-sm text-slate-500">Kata yang paling sering muncul dalam komentar</p>
        </div>
      </div>

      <div className="min-h-[200px] md:min-h-[300px] flex flex-wrap items-center justify-center gap-2 md:gap-3 p-2 md:p-4">
        {words.map((word, index) => (
          <motion.span
            key={word.text}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
            className="cursor-pointer transition-all duration-200 text-[clamp(12px,2vw,28px)] md:text-[clamp(14px,3vw,36px)]"
            style={{
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
