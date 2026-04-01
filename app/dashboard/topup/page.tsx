"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Sparkles, Check, Copy, ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  bonus: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: "basic", name: "Basic", price: 10000, credits: 100, bonus: 0 },
  { id: "standard", name: "Standard", price: 25000, credits: 300, bonus: 20, popular: true },
  { id: "premium", name: "Premium", price: 50000, credits: 700, bonus: 200 },
  { id: "enterprise", name: "Enterprise", price: 100000, credits: 1500, bonus: 500 },
];

interface TransactionData {
  id: string;
  voucherCode: string;
  orderId: string;
  packageName: string;
  price: number;
  totalCredits: number;
}

export default function TopUpPage() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const whatsappNumber = "6282291134197";
  const userEmail = user?.email || "user@example.com";

  const selectedPkg = creditPackages.find((p) => p.id === selectedPackage);
  const totalCredits = selectedPkg ? selectedPkg.credits + selectedPkg.bonus : 0;

  const generateWhatsAppUrl = (voucherCode: string) => {
    const message = `Halo Admin Vidsense AI,

Saya ingin top up kredit dengan detail berikut:

📦 Paket: ${selectedPkg?.name}
💰 Harga: Rp ${selectedPkg?.price.toLocaleString("id-ID")}
🎫 Kode Voucher: ${voucherCode}
👤 Email: ${userEmail}
💳 Metode: GoPay (Transfer)

Saya akan melakukan transfer dan mengirim bukti transfer melalui chat ini.

Terima kasih!`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCreateTransaction = async () => {
    setIsGenerating(true);
    try {
      // Authentication is handled server-side via cookies (same as /api/auth/session)
      // No need to manually extract and send token
      const res = await fetch("/api/topup/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId: selectedPackage }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal membuat transaksi");
        return;
      }

      const data = await res.json();
      
      setTransaction({
        id: data.transaction_id,
        voucherCode: data.voucher_code,
        orderId: data.order_id,
        packageName: data.package?.name || selectedPkg?.name,
        price: data.package?.price || selectedPkg?.price || 0,
        totalCredits: data.package?.total_credits || totalCredits,
      });
      
      setIsDialogOpen(true);
      toast.success("Transaksi berhasil dibuat! Silakan lanjutkan pembayaran via WhatsApp.");
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Terjadi kesalahan saat membuat transaksi");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVoucher = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.voucherCode);
      setCopied(true);
      toast.success("Kode voucher disalin!");
      setTimeout(() => setCopied(false), 2000);
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
                <li>Klik tombol "Buat Transaksi" di bawah</li>
                <li>Klik "Bayar via WhatsApp" untuk chat admin</li>
                <li>Lakukan transfer GoPay ke nomor <strong>082291134197</strong></li>
                <li>Kirim bukti transfer di WhatsApp</li>
                <li>Admin akan verifikasi dan kredit masuk ke akun Anda</li>
              </ol>
            </div>

            {/* Create Transaction Button */}
            <Button
              onClick={handleCreateTransaction}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Transaksi...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Buat Transaksi & Bayar via WhatsApp
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Pembayaran WhatsApp GoPay
              </DialogTitle>
              <DialogDescription>
                Transaksi berhasil dibuat. Lanjutkan pembayaran via WhatsApp.
              </DialogDescription>
            </DialogHeader>

            {transaction && (
              <div className="space-y-4">
                {/* Package Summary */}
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Paket</span>
                    <span className="font-semibold text-slate-900">
                      {transaction.packageName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Kredit</span>
                    <span className="font-bold text-green-600 text-lg">
                      {transaction.totalCredits} kredit
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        Rp {transaction.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voucher Code */}
                <div className="rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4">
                  <p className="text-sm text-green-800 mb-2 font-medium">
                    Kode Voucher:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-white px-4 py-3 text-lg font-mono font-bold text-green-600 border border-green-200 text-center">
                      {transaction.voucherCode}
                    </code>
                    <Button
                      onClick={handleCopyVoucher}
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Instructions */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-amber-800">
                    Langkah Selanjutnya:
                  </p>
                  <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Klik tombol WhatsApp di bawah</li>
                    <li>Chat akan terbuka dengan pesan otomatis</li>
                    <li>Transfer GoPay ke <strong>082291134197</strong></li>
                    <li>Kirim bukti transfer di chat</li>
                    <li>Tunggu admin verifikasi (1-24 jam)</li>
                  </ol>
                </div>

                {/* WhatsApp Button */}
                <a
                  href={generateWhatsAppUrl(transaction.voucherCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-700 hover:to-green-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  Bayar via WhatsApp
                  <ExternalLink className="h-4 w-4" />
                </a>

                <p className="text-center text-xs text-slate-500">
                  Kredit akan masuk setelah admin verifikasi pembayaran
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
