"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Trash2,
  AlertTriangle,
  Mail,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useAuth();
  const email = user?.email ?? "-";

  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete account dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    securityAlerts: true,
  });

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/user/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setNotifications({
            emailNotifications: data.emailNotifications ?? true,
            analysisComplete: data.analysisCompleteNotifications ?? true,
            securityAlerts: data.securityAlertNotifications ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    
    // Optimistic update
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    // Save to database
    setIsSaving(true);
    try {
      const updateData = {
        emailNotifications: key === "emailNotifications" ? newValue : undefined,
        analysisCompleteNotifications: key === "analysisComplete" ? newValue : undefined,
        securityAlertNotifications: key === "securityAlerts" ? newValue : undefined,
      };

      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        // Revert on error
        setNotifications((prev) => ({
          ...prev,
          [key]: !newValue,
        }));
        toast.error("Gagal menyimpan pengaturan");
      } else {
        toast.success("Pengaturan notifikasi disimpan");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") {
      toast.error("Silakan ketik 'HAPUS' untuk konfirmasi");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus akun");
        return;
      }

      toast.success("Akun berhasil dihapus");
      
      // Redirect to login after short delay
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1000);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Terjadi kesalahan saat menghapus akun");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Pengaturan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola akun dan preferensi notification Anda
          </p>
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-500" />
                Akun
              </CardTitle>
              <CardDescription>
                Informasi akun dan keamanan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email</p>
                    <p className="text-xs text-slate-500">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Terhubung dengan Google</span>
                </div>
              </div>
              
              <Separator />

              {/* Account Type */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Tipe Akun</p>
                  <p className="text-xs text-slate-500">Paket langganan Anda</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Gratis
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-500" />
                Notifikasi
              </CardTitle>
              <CardDescription>
                Pilih notifikasi yang ingin Anda terima
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Notifikasi Email</p>
                    <p className="text-xs text-slate-500">Terima notifikasi melalui email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  disabled={isSaving || isLoading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Analisis Selesai</p>
                    <p className="text-xs text-slate-500">Notifikasi saat analisis selesai</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.analysisComplete}
                  onCheckedChange={() => handleNotificationChange("analysisComplete")}
                  disabled={!notifications.emailNotifications || isSaving || isLoading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Peringatan Keamanan</p>
                    <p className="text-xs text-slate-500">Notifikasi penting keamanan</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.securityAlerts}
                  onCheckedChange={() => handleNotificationChange("securityAlerts")}
                  disabled={!notifications.emailNotifications || isSaving || isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Zona Berbahaya
                </CardTitle>
                <CardDescription className="text-red-700">
                  Tindakan yang tidak dapat dibatalkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Hapus Akun</p>
                      <p className="text-xs text-red-700">
                        Hapus akun Anda secara permanen beserta semua data. Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                      >
                        Hapus Akun
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600">Hapus Akun Permanen</DialogTitle>
                        <DialogDescription>
                          <div className="space-y-3 mt-2">
                            <p className="font-medium text-red-700">
                              Tindakan ini TIDAK DAPAT dibatalkan.
                            </p>
                            <p>
                              Semua data Anda akan dihapus secara permanen, termasuk:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Profil akun Anda</li>
                              <li>Riwayat analisis</li>
                              <li>Semua kredit yang tersisa</li>
                              <li>Pengaturan dan preferensi</li>
                            </ul>
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-medium">
                                Ketik <strong className="text-red-600">HAPUS</strong> di bawah ini untuk melanjutkan:
                              </p>
                              <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Ketik HAPUS di sini"
                                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={isDeleting}
                              />
                            </div>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setDeleteConfirmText("");
                          }}
                          disabled={isDeleting}
                        >
                          Batal
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || deleteConfirmText !== "HAPUS"}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menghapus...
                            </>
                          ) : (
                            "Hapus Akun"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}