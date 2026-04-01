"use client";

import { Filter } from "lucide-react";

interface TransactionsHeaderProps {
  title?: string;
  description?: string;
  total?: number;
  statusFilter?: string;
  onStatusChange?: (status: string) => void;
}

export function TransactionsHeader({
  title = "Verifikasi Pembayaran",
  description = "Verifikasi bukti transfer dari pengguna",
  total,
  statusFilter = "pending_verification",
  onStatusChange,
}: TransactionsHeaderProps) {
  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "pending_verification", label: "Menunggu Verifikasi" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Lunas" },
    { value: "rejected", label: "Ditolak" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">
          {title}
        </h1>
        <p className="text-slate-500 mt-1">
          {description}
        </p>
        {total !== undefined && (
          <p className="text-sm text-slate-500 mt-2">
            Total: <span className="font-semibold text-slate-900">{total}</span> transaksi
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
