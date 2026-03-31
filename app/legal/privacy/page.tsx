import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pendaftaran
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">
              VidSense <span className="text-slate-400">AI</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-2xl sm:p-12">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 font-heading">
            Kebijakan Privasi
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            Terakhir diperbarui: 31 Maret 2026
          </p>

          <div className="space-y-8 text-slate-700">
            {/* 1 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                1. Pendahuluan
              </h2>
              <p className="leading-relaxed">
                VidSense AI ("kami", "kita", atau "Layanan") berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda ketika Anda menggunakan platform kami.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <p className="mb-2 leading-relaxed">Kami mengumpulkan informasi berikut:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Informasi Akun:</strong> Alamat email dan nama lengkap yang Anda berikan saat pendaftaran
                </li>
                <li>
                  <strong>Data Otentikasi:</strong> Informasi login yang dikelola oleh penyedia layanan otentikasi pihak ketiga (Supabase)
                </li>
                <li>
                  <strong>Data Penggunaan:</strong> Riwayat analisis sentimen yang Anda lakukan, termasuk URL video YouTube yang dianalisis
                </li>
                <li>
                  <strong>Data Transaksi:</strong> Riwayat pembelian kredit dan saldo kredit Anda
                </li>
                <li>
                  <strong>Data Teknis:</strong> Informasi perangkat, browser, dan log akses yang dikumpulkan secara otomatis
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                3. Bagaimana Kami Menggunakan Informasi Anda
              </h2>
              <p className="mb-2 leading-relaxed">Informasi Anda digunakan untuk:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Membuat dan mengelola akun Anda</li>
                <li>Menyediakan layanan analisis sentimen YouTube</li>
                <li>Mengelola sistem kredit dan transaksi</li>
                <li>Meningkatkan kualitas dan akurasi layanan</li>
                <li>Mengirimkan pemberitahuan penting terkait akun atau Layanan</li>
                <li>Mencegah penyalahgunaan dan menjaga keamanan platform</li>
                <li>Memenuhi kewajiban hukum dan peraturan yang berlaku</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                4. Penyimpanan dan Keamanan Data
              </h2>
              <p className="leading-relaxed">
                Data pribadi Anda disimpan di server yang aman menggunakan layanan Supabase. Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda dari akses tidak sah, perubahan, pengungkapan, atau penghancuran. Meskipun demikian, tidak ada sistem yang 100% aman, dan kami tidak dapat menjamin keamanan absolut data Anda.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                5. Berbagi Data dengan Pihak Ketiga
              </h2>
              <p className="mb-2 leading-relaxed">
                Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga. Kami dapat membagikan informasi Anda dalam situasi berikut:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Penyedia Layanan:</strong> Dengan pihak ketiga yang membantu kami mengoperasikan platform (misalnya Supabase untuk database, OpenRouter untuk AI, YouTube Data API)
                </li>
                <li>
                  <strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum atau perintah pengadilan
                </li>
                <li>
                  <strong>Perlindungan Hak:</strong> Untuk melindungi hak, properti, atau keselamatan VidSense AI, pengguna kami, atau publik
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                6. Komentar YouTube
              </h2>
              <p className="leading-relaxed">
                Ketika Anda menganalisis video YouTube, Layanan kami mengambil komentar publik dari video tersebut melalui YouTube Data API. Komentar ini bersifat publik dan bukan merupakan data pribadi Anda. Kami memproses komentar tersebut hanya untuk tujuan analisis sentimen dan tidak menyimpan komentar mentah secara permanen.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                7. Hak Anda
              </h2>
              <p className="mb-2 leading-relaxed">
                Sesuai dengan peraturan perlindungan data yang berlaku, Anda memiliki hak untuk:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Mengakses data pribadi Anda yang kami simpan</li>
                <li>Memperbaiki data yang tidak akurat atau tidak lengkap</li>
                <li>Menghapus akun dan data pribadi Anda</li>
                <li>Menarik persetujuan pemrosesan data kapan saja</li>
                <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
              </ul>
              <p className="mt-2 leading-relaxed">
                Untuk menggunakan hak-hak ini, silakan hubungi kami melalui kontak yang tersedia di platform.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                8. Retensi Data
              </h2>
              <p className="leading-relaxed">
                Kami menyimpan data pribadi Anda selama akun Anda aktif dan untuk periode yang diperlukan untuk memenuhi tujuan yang dijelaskan dalam kebijakan ini, atau sebagaimana diwajibkan oleh hukum. Jika Anda menghapus akun, data pribadi Anda akan dihapus dalam waktu yang wajar, kecuali kami diwajibkan oleh hukum untuk menyimpannya lebih lama.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                9. Cookie dan Teknologi Pelacakan
              </h2>
              <p className="leading-relaxed">
                VidSense AI menggunakan cookie dan teknologi serupa untuk mengelola sesi pengguna, mengingat preferensi, dan meningkatkan pengalaman pengguna. Cookie yang kami gunakan bersifat esensial untuk fungsi platform dan tidak digunakan untuk pelacakan iklan atau tujuan pemasaran.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                10. Perubahan Kebijakan Privasi
              </h2>
              <p className="leading-relaxed">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan perubahan praktik kami atau untuk alasan operasional, hukum, atau peraturan lainnya. Setiap perubahan material akan diberitahukan melalui platform atau email. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                11. Kontak
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi ini atau pengolahan data pribadi Anda, silakan hubungi kami melalui halaman kontak yang tersedia di platform VidSense AI.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
