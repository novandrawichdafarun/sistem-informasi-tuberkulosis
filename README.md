# 🏥 Sistem Informasi Tuberkulosis (SITB)

Proyek ini dibangun menggunakan [Next.js](https://nextjs.org) (App Router) dan terintegrasi dengan **Supabase Cloud** sebagai penyedia database relasional (PostgreSQL).

---

## 🚀 Panduan Memulai untuk Tim (Setup Awal)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan proyek di komputer lokal Anda.

### 1. Klon Repositori dan Instal Dependensi

Buka terminal Anda, klon proyek ini, lalu instal seluruh pustaka yang dibutuhkan:

```bash
git clone <url-repositori-github-anda>
cd <nama-folder-proyek>
npm install
```

### 2. Konfigurasi Variabel Lingkungan (.env.local)

Salin file cetakan `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Buka file `.env.local` yang baru terbentuk, lalu isi nilai kredensial proyek Supabase Cloud bersama yang telah dibagikan oleh tim:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Tautkan Supabase CLI ke Cloud

Pastikan Anda sudah memiliki akun Supabase dan telah diundang ke dalam organisasi proyek. Jalankan perintah ini untuk menautkan terminal lokal Anda ke database cloud:

```bash
npx supabase login
npx supabase link --project-ref <id-proyek-supabase-cloud>
```

---

## 💻 Menjalankan Aplikasi Web

Setelah konfigurasi lingkungan selesai, jalankan server pengembangan Next.js:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban (browser) Anda untuk melihat hasilnya.

---

## 🗄️ Alur Kerja Migrasi Database (Penting!)

Aplikasi ini menggunakan skema pelacakan medis TB yang terdiri dari 14+ tabel kompleks. Untuk menjaga konsistensi database, patuhi aturan main berikut:

- **Menerapkan Skema Baru dari Git**: Jika Anda baru saja melakukan `git pull` dan terdapat file migrasi baru di folder `supabase/migrations/`, perbarui database cloud dengan perintah:
  ```bash
  npx supabase db push
  ```
- **Membuat Perubahan Tabel**: Jangan membuat tabel secara manual di dashboard web Supabase. Selalu gunakan CLI untuk membuat file migrasi baru:
  ```bash
  npx supabase migration new nama_perubahan_tabel
  ```
- ⚠️ **Peringatan Keamanan**: **JANGAN** pernah menjalankan perintah `npx supabase db reset` saat terminal Anda tertaut ke remote cloud, karena perintah tersebut dapat menghapus data uji coba milik anggota tim lain.

---

## 👥 Kontribusi Tim

1. Buat cabang (_branch_) baru untuk fitur Anda: `git checkout -b feat/fitur-baru`.
2. Lakukan komit (_commit_) dengan pesan yang jelas: `git commit -m "feat: tambah modul riwayat obat"`.
3. Dorong ke GitHub: `git push origin feat/fitur-baru`.
4. Buat _Pull Request_ ke cabang `main` untuk ditinjau bersama.
