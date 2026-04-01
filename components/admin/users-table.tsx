"use client";

import { User, Shield, CreditCard, Calendar } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  credit_balance: number;
  role: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onRefresh?: () => void;
}

export function UsersTable({ users, loading, onRefresh }: UsersTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Memuat data pengguna...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Tidak ada pengguna ditemukan</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        <User className="h-3 w-3" />
        User
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pengguna
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saldo Kredit
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bergabung
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold text-sm">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name || "Unknown"}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900 font-medium">{user.credit_balance || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
