"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Sparkles, Check, ExternalLink, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  bonus: number;
  popular?: boolean;
}

interface UserTransaction {
  id: string;
  package_name: string;
  total_credits: number;
  price: number;
  payment_status: string;
  created_at: string;
}

const creditPackages: CreditPackage[] = [
  { id: "basic", name: "Basic", price: 10000, credits: 100, bonus: 0 },
  { id: "standard", name: "Standard", price: 25000, credits: 300, bonus: 20, popular: true },
  { id: "premium", name: "Premium", price: 50000, credits: 700, bonus: 200 },
  { id: "enterprise", name: "Enterprise", price: 100000, credits: 1500, bonus: 500 },
];

export default function TopUpPage() {
  const { user, refreshSession } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionErrorShown, setTransactionErrorShown] = useState(false);

  const adminWhatsAppNumber = "6282291134197";
  const userEmail = user?.email || "user@example.com";

  const isValidWhatsAppNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    return (cleaned.startsWith('08') || cleaned.startsWith('628')) && cleaned.length >= 10;
  };

  const selectedPkg = creditPackages.find((p) => p.id === selectedPackage);
  const totalCredits = selectedPkg ? selectedPkg.credits + selectedPkg.bonus : 0;
  const hasPendingTransaction = useMemo(
    () =>
      transactions.some(
        (transaction) => transaction.payment_status === "pending_verification"
      ),
    [transactions]
  );

  const generateWhatsAppUrl = (voucherCode?: string) => {
    const userWADisplay = whatsappNumber || "(belum diisi)";
    const voucherLine = voucherCode ? `\n🎟️ Kode Voucher: ${voucherCode}` : "";
    const message = `Halo Admin Vidsense AI,

Saya ingin top up kredit dengan detail berikut:

📦 Paket: ${selectedPkg?.name}
💰 Harga: Rp ${selectedPkg?.price.toLocaleString("id-ID")}
👤 Email: ${userEmail}
📱 WhatsApp Saya: ${userWADisplay}
💳 Metode: GoPay (Transfer)${voucherLine}

Saya akan melakukan transfer dan mengirim bukti transfer melalui chat ini.

Terima kasih!`;

    return `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const response = await fetch("/api/me/transactions", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat riwayat top up");
      }
      setTransactions(data.transactions ?? []);
      setTransactionErrorShown(false);
    } catch (error) {
      if (!transactionErrorShown) {
        toast.error(
          error instanceof Error ? error.message : "Gagal memuat riwayat top up"
        );
        setTransactionErrorShown(true);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }, [transactionErrorShown]);

  useEffect(() => {
    fetchTransactions();
    refreshSession();
  }, [fetchTransactions, refreshSession]);

  useEffect(() => {
    const handleFocusRefresh = () => {
      if (document.visibilityState === "hidden") return;
      fetchTransactions();
      refreshSession();
    };
    window.addEventListener("focus", handleFocusRefresh);
    document.addEventListener("visibilitychange", handleFocusRefresh);
    return () => {
      window.removeEventListener("focus", handleFocusRefresh);
      document.removeEventListener("visibilitychange", handleFocusRefresh);
    };
  }, [fetchTransactions, refreshSession]);

  useEffect(() => {
    if (!hasPendingTransaction) return;
    const timer = setInterval(() => {
      fetchTransactions();
      refreshSession();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchTransactions, hasPendingTransaction, refreshSession]);

  const handlePayViaWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      toast.error("Nomor WhatsApp wajib diisi");
      return;
    }
    if (!isValidWhatsAppNumber(whatsappNumber)) {
      toast.error("Nomor WhatsApp tidak valid. Gunakan format 08xx atau 628xx (min. 10 digit)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/topup/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage, whatsappNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        const parts: string[] = [];
        if (data?.error) parts.push(String(data.error));
        if (data?.details) parts.push(`Details: ${String(data.details)}`);
        if (data?.code) parts.push(`Code: ${String(data.code)}`);
        if (data?.hint) parts.push(`Hint: ${String(data.hint)}`);
        throw new Error(parts.length ? parts.join(" | ") : "Gagal membuat transaksi");
      }

      const url = generateWhatsAppUrl(data.voucher_code);
      window.open(url, "_blank");
      toast.success(`Transaksi dibuat! Kode voucher: ${data.voucher_code}. Silakan lanjutkan pembayaran via WhatsApp.`);
      await fetchTransactions();
      await refreshSession();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 border border-green-100">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 font-heading">
              Top Up Kredit
            </h1>
            <p className="text-sm text-slate-500">
              Pilih paket dan bayar via WhatsApp GoPay
            </p>
          </div>
        </motion.div>

        {/* Credit Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {creditPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                selectedPackage === pkg.id
                  ? "border-green-500 bg-green-50/50 ring-2 ring-green-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 font-heading">
                  Rp {pkg.price.toLocaleString("id-ID")}
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-green-600">
                    {pkg.credits}
                  </span>
                  <span className="text-sm text-slate-500">kredit</span>
                </div>
                {pkg.bonus > 0 && (
                  <p className="mt-1 text-sm font-medium text-emerald-600">
                    +{pkg.bonus} bonus
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Total: {pkg.credits + pkg.bonus} kredit
                </p>
              </div>

              {selectedPackage === pkg.id && (
                <div className="absolute bottom-3 right-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Section - WhatsApp Only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 font-heading mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Pembayaran via WhatsApp GoPay
          </h2>

          <div className="space-y-4">
            {/* Selected Package Summary */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Paket</span>
                <span className="font-semibold text-slate-900">
                  {selectedPkg?.name} ({selectedPkg?.credits} Kredit)
                </span>
              </div>
              {selectedPkg && selectedPkg.bonus > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Bonus</span>
                  <span className="font-semibold text-emerald-600">
                    +{selectedPkg.bonus} Kredit
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {selectedPkg?.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">
                Cara Pembayaran:
              </p>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Isi nomor WhatsApp Anda di bawah</li>
                <li>Klik tombol "Bayar via WhatsApp"</li>
                <li>Lakukan transfer GoPay ke nomor <strong>082291134197</strong></li>
                <li>Kirim bukti transfer di WhatsApp</li>
                <li>Admin akan verifikasi dan kredit masuk ke akun Anda</li>
              </ol>
            </div>

            {/* WhatsApp Number Input */}
            <div className="space-y-2">
              <label htmlFor="whatsapp-number" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-green-600" />
                Nomor WhatsApp
              </label>
              <input
                id="whatsapp-number"
                type="tel"
                inputMode="numeric"
                placeholder="Contoh: 081234567890"
                value={whatsappNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setWhatsappNumber(val);
                }}
                className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors ${
                  whatsappNumber && !isValidWhatsAppNumber(whatsappNumber)
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/30"
                    : whatsappNumber && isValidWhatsAppNumber(whatsappNumber)
                    ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-green-50/30"
                    : "border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white"
                }`}
              />
              {whatsappNumber && !isValidWhatsAppNumber(whatsappNumber) && (
                <p className="text-xs text-red-500">
                  Nomor harus diawali 08 atau 628, minimal 10 digit
                </p>
              )}
              {whatsappNumber && isValidWhatsAppNumber(whatsappNumber) && (
                <p className="text-xs text-green-600">
                  Nomor WhatsApp valid
                </p>
              )}
              <p className="text-xs text-slate-500">
                Digunakan untuk menghubungi Anda terkait pembayaran
              </p>
            </div>

            {/* Pay via WhatsApp Button */}
            <Button
              onClick={handlePayViaWhatsApp}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25"
              size="lg"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Memproses..." : "Bayar via WhatsApp"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 font-heading mb-3">
            Status Top Up Terbaru
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Paket terpilih: {selectedPkg?.name} ({totalCredits} kredit)
          </p>
          {loadingTransactions ? (
            <p className="text-sm text-slate-500">Memuat transaksi...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada transaksi top up.</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-lg border border-slate-200 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.package_name} - {transaction.total_credits} kredit
                    </p>
                    <p className="text-xs text-slate-500">
                      Rp {transaction.price.toLocaleString("id-ID")} -{" "}
                      {new Date(transaction.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      transaction.payment_status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : transaction.payment_status === "pending_verification"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {transaction.payment_status === "pending_verification"
                      ? "Menunggu Verifikasi"
                      : transaction.payment_status === "paid"
                        ? "Lunas"
                        : "Ditolak"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
