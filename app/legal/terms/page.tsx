import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function TermsPage() {
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
            Syarat dan Ketentuan
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            Terakhir diperbarui: 31 Maret 2026
          </p>

          <div className="space-y-8 text-slate-700">
            {/* 1 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                1. Penerimaan Syarat
              </h2>
              <p className="leading-relaxed">
                Dengan mengakses dan menggunakan platform VidSense AI ("Layanan"), Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, harap tidak menggunakan Layanan kami.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                2. Deskripsi Layanan
              </h2>
              <p className="leading-relaxed">
                VidSense AI adalah platform berbasis kecerdasan buatan yang menyediakan layanan analisis sentimen terhadap komentar video YouTube. Layanan ini menggunakan teknologi AI untuk mengklasifikasikan komentar ke dalam kategori positif, negatif, dan netral.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                3. Pendaftaran Akun
              </h2>
              <p className="mb-2 leading-relaxed">Untuk menggunakan Layanan, Anda wajib:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Mendaftar dengan informasi yang akurat dan lengkap</li>
                <li>Memastikan email yang digunakan valid dan dapat diakses</li>
                <li>Menjaga kerahasiaan kredensial akun Anda</li>
                <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                4. Sistem Kredit
              </h2>
              <p className="mb-2 leading-relaxed">
                Layanan VidSense AI menggunakan sistem kredit untuk penggunaan fitur analisis:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Setiap pengguna baru mendapatkan kredit awal secara gratis</li>
                <li>Setiap analisis sentimen membutuhkan sejumlah kredit</li>
                <li>Kredit dapat ditambahkan melalui fitur top-up</li>
                <li>Kredit yang telah dibeli tidak dapat dikembalikan (non-refundable)</li>
                <li>Kredit tidak dapat ditransfer ke akun lain</li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                5. Penggunaan yang Diperbolehkan
              </h2>
              <p className="mb-2 leading-relaxed">Anda setuju untuk tidak:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Menggunakan Layanan untuk tujuan ilegal atau melanggar hukum</li>
                <li>Mencoba mengakses, memanipulasi, atau mengganggu sistem secara tidak sah</li>
                <li>Menggunakan Layanan untuk mengumpulkan data pribadi tanpa izin</li>
                <li>Menyalahgunakan sistem kredit atau melakukan kecurangan</li>
                <li>Menggunakan Layanan untuk mengirim spam atau konten berbahaya</li>
                <li>Mereproduksi, mendistribusikan, atau membuat karya turunan dari Layanan tanpa izin tertulis</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                6. Hak Kekayaan Intelektual
              </h2>
              <p className="leading-relaxed">
                Seluruh konten, kode sumber, desain, logo, dan materi lainnya yang tersedia di VidSense AI dilindungi oleh hak cipta dan hukum kekayaan intelektual lainnya. Anda tidak diperkenankan menyalin, memodifikasi, atau mendistribusikan materi tersebut tanpa izin tertulis dari kami.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                7. Batasan Tanggung Jawab
              </h2>
              <p className="leading-relaxed">
                VidSense AI menyediakan hasil analisis sentimen berdasarkan teknologi kecerdasan buatan. Hasil analisis bersifat perkiraan dan tidak dijamin 100% akurat. Kami tidak bertanggung jawab atas keputusan atau tindakan yang diambil berdasarkan hasil analisis dari Layanan kami. Layanan disediakan "sebagaimana adanya" tanpa jaminan apapun.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                8. Ketersediaan Layanan
              </h2>
              <p className="leading-relaxed">
                Kami berusaha menjaga Layanan tetap tersedia 24/7, namun tidak menjamin bahwa Layanan akan selalu berjalan tanpa gangguan. Kami berhak melakukan pemeliharaan, pembaruan, atau perubahan pada Layanan kapan saja tanpa pemberitahuan sebelumnya.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                9. Pengakhiran Akun
              </h2>
              <p className="leading-relaxed">
                Kami berhak menangguhkan atau mengakhiri akun Anda jika ditemukan pelanggaran terhadap Syarat dan Ketentuan ini, tanpa pemberitahuan sebelumnya dan tanpa kewajiban untuk mengembalikan kredit yang tersisa.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                10. Perubahan Syarat dan Ketentuan
              </h2>
              <p className="leading-relaxed">
                Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini. Penggunaan Layanan Anda setelah perubahan merupakan persetujuan terhadap syarat yang diperbarui.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                11. Hukum yang Berlaku
              </h2>
              <p className="leading-relaxed">
                Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan melalui musyawarah untuk mufakat, dan jika tidak tercapai, akan diselesaikan melalui jalur hukum yang berlaku.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                12. Kontak
              </h2>
              <p className="leading-relaxed">
                Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi kami melalui halaman kontak yang tersedia di platform VidSense AI.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
