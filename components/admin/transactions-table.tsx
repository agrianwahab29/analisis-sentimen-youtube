"use client";

import { Check, X, Clock, DollarSign, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  user_email: string;
  package_name: string;
  voucher_code: string;
  price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  total_credits: number;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  onApprove: (transactionId: string) => void;
  onReject: (transactionId: string, reason?: string) => void;
  onRefresh?: () => void;
}

export function TransactionsTable({
  transactions,
  loading,
  onApprove,
  onReject,
}: TransactionsTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Memuat data transaksi...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Tidak ada transaksi ditemukan</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_verification: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <Clock className="h-3 w-3" />
          Menunggu Verifikasi
        </span>
      ),
      pending: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      ),
      paid: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <Check className="h-3 w-3" />
          Lunas
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
          <X className="h-3 w-3" />
          Ditolak
        </span>
      ),
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getPaymentMethodBadge = (method: string) => {
    if (method === "whatsapp_gopay") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <MessageCircle className="h-3 w-3" />
          WhatsApp GoPay
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <DollarSign className="h-3 w-3" />
        Sociabuzz
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
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paket
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Voucher
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Metode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{t.user_email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{t.package_name}</p>
                    <p className="text-xs text-slate-500">{t.total_credits} kredit</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                    {t.voucher_code}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">
                    Rp {t.price.toLocaleString("id-ID")}
                  </p>
                </td>
                <td className="px-6 py-4">{getPaymentMethodBadge(t.payment_method)}</td>
                <td className="px-6 py-4">{getStatusBadge(t.payment_status)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(t.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  {t.payment_status === "pending_verification" && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => onApprove(t.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onReject(t.id, "Tidak sesuai")}
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {t.payment_status !== "pending_verification" && (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
