"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Sparkles, Check, Copy, ExternalLink, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

interface GeneratedVoucher {
  voucherCode: string;
  orderId: string;
  transactionId: string;
  sociabuzzUrl: string;
}

export default function TopUpPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<GeneratedVoucher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sociabuzzUrl = "https://sociabuzz.com/agrianwahab/tribe";
  const tribeId = "agrianwahab";

  const handleCopyTribeId = () => {
    navigator.clipboard.writeText(tribeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPkg = creditPackages.find((p) => p.id === selectedPackage);
  const totalCredits = selectedPkg ? selectedPkg.credits + selectedPkg.bonus : 0;

  const handleGenerateVoucher = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/topup/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPackage }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal generate voucher");
        return;
      }

      const data = await res.json();
      setGeneratedVoucher({
        voucherCode: data.voucher_code,
        orderId: data.order_id,
        transactionId: data.transaction_id,
        sociabuzzUrl: `${data.payment_instructions.sociabuzz_url}?message=${encodeURIComponent(`Voucher: ${data.voucher_code}`)}`,
      });
      setIsDialogOpen(true);
      toast.success("Voucher berhasil dibuat!");
    } catch (error) {
      console.error("Failed to generate voucher:", error);
      toast.error("Terjadi kesalahan saat membuat voucher");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyVoucher = () => {
    if (generatedVoucher) {
      navigator.clipboard.writeText(generatedVoucher.voucherCode);
      toast.success("Kode voucher disalin!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 font-heading">
              Top Up Kredit
            </h1>
            <p className="text-sm text-slate-500">
              Pilih paket kredit untuk menganalisis lebih banyak video
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
                  ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 card-shadow-hover"
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
                  <span className="text-3xl font-bold text-blue-600">
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
                  Total: {totalCredits} kredit
                </p>
              </div>

              {selectedPackage === pkg.id && (
                <div className="absolute bottom-3 right-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-6 card-shadow"
        >
          <h2 className="text-lg font-semibold text-slate-900 font-heading mb-4">
            Pembayaran via Sociabuzz
          </h2>

          <div className="space-y-4">
            {/* Selected Package Summary */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">Paket</span>
                <span className="font-semibold text-slate-900">
                  {selectedPkg?.credits} Kredit
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
                  <span className="text-2xl font-bold text-blue-600">
                    Rp {selectedPkg?.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>



            {/* Generate Voucher Button */}
            <Button
              onClick={handleGenerateVoucher}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Voucher...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Buat Voucher Pembayaran
                </>
              )}
            </Button>

            <p className="text-center text-xs text-slate-500">
              Voucher unik akan dibuat untuk transaksi ini
            </p>
          </div>
        </motion.div>

        {/* Payment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Pembayaran Top Up
              </DialogTitle>
              <DialogDescription>
                Selesaikan pembayaran dengan voucher code ini
              </DialogDescription>
            </DialogHeader>

            {generatedVoucher && (
              <div className="space-y-4">
                {/* Package Summary */}
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Paket</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPkg?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Kredit</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {totalCredits} kredit
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        Rp {selectedPkg?.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voucher Code */}
                <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800 mb-2 font-medium">
                    Kode Voucher Pembayaran:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-white px-4 py-3 text-lg font-mono font-bold text-blue-600 border border-blue-200 text-center">
                      {generatedVoucher.voucherCode}
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

                {/* Payment Instructions */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-amber-800">
                    Cara Pembayaran:
                  </p>
                  <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                    <li>Salin kode voucher di atas</li>
                    <li>Klik tombol "Bayar di Sociabuzz" di bawah</li>
                    <li>Pilih nominal sesuai paket yang dipilih</li>
                    <li>Paste kode voucher di kolom "Pesan" saat checkout</li>
                    <li>Selesaikan pembayaran via QRIS/e-wallet</li>
                    <li>Kredit otomatis masuk setelah pembayaran berhasil</li>
                  </ol>
                </div>

                {/* Pay Button */}
                <motion.a
                  href={generatedVoucher.sociabuzzUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-700 hover:to-green-800"
                >
                  Bayar di Sociabuzz
                  <ExternalLink className="h-4 w-4" />
                </motion.a>

                <p className="text-center text-xs text-slate-500">
                  Kredit akan otomatis masuk setelah pembayaran berhasil
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-slate-200 bg-white p-6 card-shadow"
        >
          <h2 className="text-lg font-semibold text-slate-900 font-heading mb-4">
            Riwayat Transaksi Terakhir
          </h2>

          <div className="space-y-3">
            {[
              { date: "31 Mar 2026", type: "Pembelian", amount: 300, price: 25000 },
              { date: "28 Mar 2026", type: "Pembelian", amount: 100, price: 10000 },
              { date: "25 Mar 2026", type: "Penggunaan", amount: -50, video: "Cara Membuat Konten Viral" },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {transaction.type === "Pembelian" ? (
                      <span className="text-emerald-600">+{transaction.amount} Kredit</span>
                    ) : (
                      <span className="text-rose-600">{transaction.amount} Kredit</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {transaction.date}
                    {transaction.video && ` • ${transaction.video}`}
                  </p>
                </div>
                <div className="text-right">
                  {transaction.type === "Pembelian" ? (
                    <p className="text-sm font-semibold text-slate-900">
                      Rp {transaction.price?.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Analisis Video</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
