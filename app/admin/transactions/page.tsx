"use client";

import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { TransactionsHeader } from "@/components/admin/transactions-header";
import { TransactionsTable } from "@/components/admin/transactions-table";
import { toast } from "sonner";

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

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending_verification");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/transactions?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch transactions");
      }

      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, offset]);

  const handleApprove = async (transactionId: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve transaction");
      }

      toast.success(`Transaksi disetujui! ${data.credits_added} kredit ditambahkan.`);
      fetchTransactions();
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Gagal menyetujui transaksi");
    }
  };

  const handleReject = async (transactionId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject transaction");
      }

      toast.success("Transaksi ditolak");
      fetchTransactions();
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Gagal menolak transaksi");
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <TransactionsHeader
          title="Verifikasi Pembayaran"
          description="Verifikasi bukti transfer dari pengguna"
          total={total}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onRefresh={fetchTransactions}
        />
      </div>
    </AdminDashboardLayout>
  );
}
