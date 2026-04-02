"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserCheck, 
  UserX, 
  CreditCard, 
  Trash2, 
  Shield, 
  Ban, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  created_at: string;
  credit_balance: number;
  role: string;
  is_approved: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export function UsersTable({ users, loading, onRefresh }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprove = async (userId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to approve user");

      toast.success("User berhasil di-approve!");
      onRefresh();
    } catch (error) {
      toast.error("Gagal approve user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedUser || !creditsAmount) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          credits: parseInt(creditsAmount),
          notes: "Manual credit from admin"
        }),
      });

      if (!res.ok) throw new Error("Failed to add credits");

      toast.success(`Berhasil menambah ${creditsAmount} kredit!`);
      setIsAddCreditsOpen(false);
      setCreditsAmount("");
      onRefresh();
    } catch (error) {
      toast.error("Gagal menambah kredit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const action = selectedUser.is_suspended ? "unsuspend" : "suspend";
      const res = await fetch(`/api/admin/users/${selectedUser.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action,
          reason: suspendReason
        }),
      });

      if (!res.ok) throw new Error("Failed to suspend user");

      toast.success(selectedUser.is_suspended ? "User diaktifkan kembali!" : "User ditangguhkan!");
      setIsSuspendOpen(false);
      setSuspendReason("");
      onRefresh();
    } catch (error) {
      toast.error("Gagal mengubah status user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User berhasil dihapus!");
      setIsDeleteOpen(false);
      onRefresh();
    } catch (error) {
      toast.error("Gagal menghapus user");
    } finally {
      setIsProcessing(false);
    }
  };

  const openAddCredits = (user: User) => {
    setSelectedUser(user);
    setIsAddCreditsOpen(true);
  };

  const openSuspend = (user: User) => {
    setSelectedUser(user);
    setSuspendReason(user.suspension_reason || "");
    setIsSuspendOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_approved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <AlertCircle className="h-3 w-3" />
          Pending Approval
        </span>
      );
    }
    
    if (user.is_suspended) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
          <Ban className="h-3 w-3" />
          Ditangguhkan
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle className="h-3 w-3" />
        Aktif
      </span>
    );
  };

  return (
    <>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Saldo Kredit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Bergabung
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">{user.credit_balance || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.is_approved && (
                        <Button
                          onClick={() => handleApprove(user.id)}
                          disabled={isProcessing}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => openAddCredits(user)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50 border-blue-200"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={() => openSuspend(user)}
                        variant="outline"
                        size="sm"
                        className={user.is_suspended ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200" : "text-amber-600 hover:bg-amber-50 border-amber-200"}
                      >
                        {user.is_suspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>

                      <Button
                        onClick={() => openDelete(user)}
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kredit Manual</DialogTitle>
            <DialogDescription>
              Tambahkan kredit ke akun {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Kredit
              </label>
              <input
                id="credits"
                type="number"
                value={creditsAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreditsAmount(e.target.value)}
                placeholder="Contoh: 500"
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddCreditsOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleAddCredits} 
                disabled={isProcessing || !creditsAmount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Memproses..." : "Tambah Kredit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suspend/Unsuspend Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_suspended ? "Aktifkan Kembali User" : "Tangguhkan User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_suspended 
                ? `Aktifkan kembali akun ${selectedUser.email}`
                : `Tangguhkan akses ${selectedUser?.email} ke platform`
              }
            </DialogDescription>
          </DialogHeader>
          {!selectedUser?.is_suspended && (
            <div className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                  Alasan Penangguhan
                </label>
                <textarea
                  id="reason"
                  value={suspendReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuspendReason(e.target.value)}
                  placeholder="Jelaskan alasan penangguhan..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleSuspend} 
                  disabled={isProcessing}
                  className={selectedUser?.is_suspended ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}
                >
                  {isProcessing ? "Memproses..." : selectedUser?.is_suspended ? "Aktifkan" : "Tangguhkan"}
                </Button>
              </div>
            </div>
          )}
          {selectedUser?.is_suspended && (
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSuspend} 
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing ? "Memproses..." : "Aktifkan Kembali"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              Hapus Pengguna
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun "{selectedUser?.email}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isProcessing}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {isProcessing ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
