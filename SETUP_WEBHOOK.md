# 🔔 Setup Sociabuzz Webhook untuk Topup Otomatis

## 📋 Yang Sudah Diimplementasikan:

✅ **Voucher Code System**
- User pilih paket → generate voucher code unik
- Voucher code tersimpan di database dengan status pending
- Format: `VID-XXXXXX` (6 karakter alphanumeric)

✅ **Webhook Handler**
- Endpoint: `https://analisis-sentimen-youtube.vercel.app/api/topup/callback`
- Auto-verify pembayaran dari Sociabuzz
- Auto-add credits ke user account
- Update transaction status ke 'paid'

✅ **Database Schema**
- Tabel `transactions` dengan kolom lengkap
- Function `add_credits_to_user()` untuk auto-add credits
- RLS policies untuk keamanan

---

## ⚙️ CARA SETUP WEBHOOK DI SOCIABUZZ:

### **Step 1: Login ke Sociabuzz Dashboard**
1. Buka https://sociabuzz.com/dashboard
2. Login dengan akun Anda (Agrian Wahab)

### **Step 2: Masuk ke Settings/Integrations**
1. Cari menu **"Settings"** atau **"Integrations"**
2. Cari bagian **"Webhook"** atau **"API Webhook"**

### **Step 3: Add New Webhook**
Tambahkan webhook dengan detail berikut:

```
Webhook URL: https://analisis-sentimen-youtube.vercel.app/api/topup/callback

Events: 
☑ Payment Completed
☑ Payment Success
☑ Transaction Paid

Secret Key (optional): (kosongkan atau generate random string)
```

### **Step 4: Test Webhook**
1. Lakukan test payment kecil (Rp 10.000)
2. Check webhook logs di Sociabuzz dashboard
3. Pastikan response status = 200 OK

---

## 🔧 ALTERNATIF: Jika Sociabuzz Tidak Support Webhook

Jika Sociabuzz Tribe **tidak mendukung webhook**, gunakan salah satu alternatif:

### **Option A: Manual Verification (Semi-Otomatis)**
1. User generate voucher code di aplikasi
2. User bayar di Sociabuzz + paste voucher code di kolom "Pesan"
3. **Anda cek manual** di Sociabuzz dashboard siapa yang bayar
4. **Anda add credits manual** via Supabase dashboard:
   ```sql
   -- Tambah credits manual
   UPDATE users 
   SET credit_balance = credit_balance + 100 
   WHERE email = 'email@pembeli.com';
   ```

### **Option B: Gunakan Sociabuzz API (Polling)**
Saya bisa buat script yang:
- Polling Sociabuzz API setiap 1 menit
- Check pembayaran baru
- Auto-add credits jika payment success

**Note:** Sociabuzz perlu enable API access untuk ini.

### **Option C: Midtrans/Xendit (Recommended)**
Payment gateway resmi dengan webhook support penuh:
- ✅ Webhook otomatis
- ✅ QRIS, GoPay, OVO, Dana, dll
- ✅ Auto-verify pembayaran
- ✅ Butuh verifikasi bisnis (KTP/NPWP)

---

##  MONITORING TRANSAKSI:

### **Via Supabase Dashboard:**

1. **Cek semua transaksi:**
   ```sql
   SELECT * FROM transactions 
   ORDER BY created_at DESC 
   LIMIT 50;
   ```

2. **Cek transaksi pending:**
   ```sql
   SELECT * FROM transactions 
   WHERE payment_status = 'pending' 
   ORDER BY created_at DESC;
   ```

3. **Cek credit balance semua user:**
   ```sql
   SELECT email, credit_balance, created_at 
   FROM users 
   ORDER BY credit_balance DESC;
   ```

4. **Manual add credits (jika diperlukan):**
   ```sql
   SELECT add_credits_to_user(
     'user-uuid-here', 
     100 -- jumlah kredit
   );
   ```

### **Via Aplikasi:**
- User bisa cek riwayat transaksi di halaman Top Up
- Credit balance ditampilkan di header dashboard

---

## 🧪 TESTING FLOW:

### **Test 1: Generate Voucher**
1. Login ke aplikasi
2. Buka `/dashboard/topup`
3. Pilih paket (misal: Standard Rp 25.000)
4. Klik "Buat Voucher Pembayaran"
5. Dialog muncul dengan voucher code: `VID-ABC123`
6. **✅ Voucher code tersimpan di database**

### **Test 2: Simulasi Pembayaran**
1. Klik "Bayar di Sociabuzz"
2. Paste voucher code di kolom "Pesan" saat checkout
3. Bayar via QRIS/e-wallet
4. **Jika webhook aktif:** Kredit otomatis masuk dalam 1-2 menit
5. **Jika webhook tidak aktif:** Credit masuk manual setelah Anda verify

### **Test 3: Verify Credit Masuk**
1. Refresh halaman `/dashboard/topup`
2. Check credit balance di header (kanan atas)
3. Check riwayat transaksi di bagian bawah
4. **✅ Credit balance bertambah**

---

## 🔍 TROUBLESHOOTING:

### **Problem: Kredit tidak masuk setelah bayar**

**Check 1: Webhook Logs**
```bash
# Check logs di Vercel dashboard
https://vercel.com/agrianwahab29/analisis-sentimen-youtube/functions
```

**Check 2: Database Transactions**
```sql
-- Check transaksi terakhir
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

**Check 3: User Credit Balance**
```sql
SELECT email, credit_balance FROM users;
```

### **Problem: Webhook tidak dipanggil**

**Solusi:**
1. Pastikan webhook URL benar: `https://analisis-sentimen-youtube.vercel.app/api/topup/callback`
2. Check Sociabuzz dashboard → webhook logs
3. Test manual dengan curl:
   ```bash
   curl -X POST https://analisis-sentimen-youtube.vercel.app/api/topup/callback \
     -H "Content-Type: application/json" \
     -d '{
       "order_id": "TEST-123",
       "amount": 10000,
       "status": "paid",
       "email": "test@example.com",
       "message": "Voucher: VID-ABC123"
     }'
   ```

### **Problem: Invalid voucher code**

**Solusi:**
1. Pastikan format voucher code benar: `VID-XXXXXX`
2. Check di database:
   ```sql
   SELECT * FROM transactions 
   WHERE voucher_code = 'VID-ABC123';
   ```

---

## 📱 MONITORING DASHBOARD:

### **Untuk Admin (Anda):**

Buat halaman admin baru `/admin/transactions` untuk monitoring:
- Semua transaksi real-time
- Filter by status (pending/paid/failed)
- Manual credit adjustment jika diperlukan
- Export to CSV untuk laporan

**Mau saya buatkan halaman admin monitoring ini?** 👍

---

## ✅ CHECKLIST SETUP:

- [ ] Deploy code ke Vercel (sedang berjalan)
- [ ] Setup webhook di Sociabuzz dashboard
- [ ] Test generate voucher code
- [ ] Test payment flow (Rp 10.000)
- [ ] Verify kredit masuk otomatis
- [ ] Monitoring transaksi di Supabase
- [ ] (Optional) Buat admin dashboard monitoring

---

## 🎯 NEXT STEPS:

1. **Tunggu deploy Vercel selesai** (~3-4 menit)
2. **Setup webhook di Sociabuzz** (ikuti step di atas)
3. **Test payment** dengan nominal kecil (Rp 10.000)
4. **Verify kredit masuk** otomatis
5. **Monitor** di Supabase dashboard

**Jika ada masalah atau butuh admin dashboard, kabari saya!** 🚀
