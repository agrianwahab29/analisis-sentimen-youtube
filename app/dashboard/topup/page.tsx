"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Sparkles, Check, Copy, ExternalLink } from "lucide-react";

interface CreditPackage {
  id: string;
  price: number;
  credits: number;
  bonus: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: "basic", price: 10000, credits: 100, bonus: 0 },
  { id: "standard", price: 25000, credits: 300, bonus: 20, popular: true },
  { id: "premium", price: 50000, credits: 700, bonus: 200 },
  { id: "enterprise", price: 100000, credits: 1500, bonus: 500 },
];

export default function TopUpPage() {
  const [selectedPackage, setSelectedPackage] = useState<string>("standard");
  const [voucherCode, setVoucherCode] = useState("");
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

            {/* Tribe ID Copy */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800 mb-2">
                Gunakan Tribe ID ini saat membayar di Sociabuzz:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white px-4 py-2.5 text-lg font-mono font-semibold text-slate-900 border border-amber-200">
                  {tribeId}
                </code>
                <button
                  onClick={handleCopyTribeId}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-white font-medium hover:bg-amber-600 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Voucher Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Kode Voucher (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Masukkan kode voucher"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                  Gunakan
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <motion.a
              href={sociabuzzUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800"
            >
              Bayar di Sociabuzz
              <ExternalLink className="h-4 w-4" />
            </motion.a>

            <p className="text-center text-xs text-slate-500">
              Anda akan diarahkan ke Sociabuzz untuk menyelesaikan pembayaran
            </p>
          </div>
        </motion.div>

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
