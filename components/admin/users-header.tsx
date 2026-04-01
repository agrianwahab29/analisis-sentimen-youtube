"use client";

import { Search } from "lucide-react";

interface UsersHeaderProps {
  title?: string;
  description?: string;
  total?: number;
  onSearch?: (value: string) => void;
}

export function UsersHeader({ 
  title = "Kelola Pengguna", 
  description = "Tambah, edit, dan kelola akun pengguna",
  onSearch 
}: UsersHeaderProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">
          {title}
        </h1>
        <p className="text-slate-500 mt-1">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengguna..."
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>
    </div>
  );
}
