# 🏥 Sistem Informasi Tuberkulosis (SITB)

![SITB Logo](public/logo.png)

Sistem Informasi Tuberkulosis (SITB) adalah aplikasi web berbasis Next.js (App Router) yang dirancang untuk membantu pencatatan, pemantauan, dan pengelolaan data pasien tuberkulosis secara terintegrasi dengan Supabase Cloud sebagai penyedia database relasional PostgreSQL.

---

## 🚀 Panduan Instalasi (Setup Awal)

Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan proyek di komputer lokal Anda.

### 1. Persyaratan Sistem

Sebelum memulai, pastikan perangkat Anda telah menginstal hal-hal berikut:

- Node.js 18 atau versi yang lebih baru
- npm, pnpm, yarn, atau bun
- Akun Supabase Cloud
- Akses ke project Supabase tim
- Akses ke repositori GitHub tim

### 2. Clone Repository dan Instal Dependensi

Buka terminal, lalu jalankan perintah berikut:

```bash
git clone https://github.com/novandrawichdafarun/sistem-informasi-tuberkulosis.git
cd sistem-informasi-tuberkulosis
npm install
```

### 3. Konfigurasi Local Environment (.env.local)

Buat file `.env.local` berdasarkan template yang tersedia:

- Jika menggunakan Linux/macOS/WSL:

```bash
cp .env.example .env.local
```

- Jika menggunakan Windows (PowerShell):

```powershell
copy .env.example .env.local
```

Setelah file dibuat, isi nilai konfigurasi berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SUPABASE_PASSWORD=your-supabase-password
```

Jika file `.env.example` belum tersedia, buat file `.env.local` secara manual dan isi variabel di atas sesuai konfigurasi project tim Anda.

### 4. Hubungkan Supabase CLI ke Cloud

Pastikan Anda telah login ke akun Supabase dan memiliki akses ke project tim. Jalankan perintah ini untuk menautkan ke database cloud:

```bash
npx supabase login
npx supabase link --project-ref <id-proyek-supabase-cloud>
```

### 5. Jalankan Aplikasi

Setelah semua konfigurasi selesai, jalankan aplikasi dengan perintah berikut:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban (browser).

---

## 📂 Struktur Folder

```
sistem-informasi-tuberkulosis/
├─ action/                   # Fungsi aksi server-side untuk pemrosesan data
├─ app/                      # Route dan layout aplikasi berbasis Next.js App Router
├─ components/               # Komponen UI yang dapat digunakan kembali
├─ docs/                     # Dokumentasi proyek dan panduan penggunaan aplikasi
├─ public/                   # Aset statis seperti gambar, ikon, dan file publik
├─ schemas/                  # Skema validasi data menggunakan Zod
├─ services/                 # Layer pemanggilan API dan layanan bisnis
├─ style/                    # File CSS global dan tema
├─ supabase/
│  └─ migrations/            # File migrasi database
│  └─ seeders/               # File seeder database
├─ types/                    # Definisi tipe TypeScript
├─ utils/                    # Fungsi utilitas dan helper
│  └─ supabase/              # Konfigurasi database
├─ .env.example              # Contoh file environment
├─ .gitignore                # File untuk mengabaikan file tertentu saat commit
├─ AGENTS.md                 # Next.js Agent Rules
├─ eslint.config.mjs         # Konfigurasi ESLint
├─ next.config.js            # Konfigurasi Next.js
├─ package-lock.json         # File lock dependensi npm
├─ package.json              # Daftar dependency dan script proyek
├─ proxy.ts                  # Middleware Next.js untuk autentikasi dan otorisasi
├─ README.md                 # Panduan proyek dan dokumentasi
└─ tsconfig.json             # Konfigurasi TypeScript
```

Penjelasan singkat

- app/ digunakan untuk mendefinisikan halaman dan layout aplikasi.
- components/ berisi komponen UI yang bersifat reusable.
- services/ berisi logika bisnis dan pemanggilan API.
- types/ berisi definisi tipe data TypeScript.
- utils/ berisi helper, utilitas, dan konfigurasi umum.
- migrations/ wajib digunakan untuk setiap perubahan skema database.

---

## 🗄️ Schema Database

Skema database dikelola menggunakan PostgreSQL melalui Supabase. Semua tabel sebaiknya dibuat dan diubah melalui migrasi.

![ERD Sistem TB](docs/ERD%20Sistem%20TB.png)

Relasi Inti

- Tabel pasien memiliki relasi one-to-many dengan tabel episode pengobatan.
- Tabel episode pengobatan memiliki relasi one-to-many dengan tabel pemeriksaan klinis, pemeriksaan lab, dan resep pengobatan.
- Tabel episode pengobatan juga memiliki relasi one-to-one dengan tabel diagnosis dan hasil akhir.
- Tabel resep pengobatan memiliki relasi one-to-many dengan tabel detail obat dan jadwal minum obat.
- Tabel obat memiliki relasi one-to-many dengan tabel detail obat.
- Tabel Jadwal Minum Obat memiliki relasi one-to-one dengan tabel medication log (catatan kepatuhan).

Aturan Umum Schema

- Gunakan `uuid` untuk primary key.
- Gunakan `TIMESTAMP WITH TIME ZONE` untuk kolom tanggal dan waktu.
- Beri `NOT NULL` pada kolom yang wajib diisi.
- Tambahkan indeks pada kolom yang sering dipakai untuk filter atau join.

---

## 🧑‍💻 Style Coding (Gaya Penulisan)

Untuk menjaga konsistensi kode dan kualitas pengembangan, ikuti pedoman berikut.

1. Bahasa Pemrograman
   - Gunakan TypeScript untuk fitur baru.
   - Hindari penggunaan kode JavaScript mentah jika fitur dapat ditulis dengan TypeScript.

2. Penamaan
   - Folder App Router: gunakan kebab-case
     - Contoh: medical-records, patient-history
   - Komponen React: gunakan PascalCase
     - Contoh: PatientTable, MedicationForm
   - Variabel dan fungsi: gunakan camelCase
     - Contoh: patientName, fetchPatientData
   - Konstanta: gunakan UPPER_SNAKE_CASE
     - Contoh: API_BASE_URL

3. Struktur Kode
   - Buat komponen yang kecil, fokus, dan mudah dipahami.
   - Hindari logika yang terlalu panjang dalam satu fungsi.
   - Gunakan interface atau type untuk struktur data.
   - Hindari penggunaan any pada tipe data.

4. Format Kode
   - Gunakan Prettier untuk format kode otomatis.
   - Gunakan ESLint untuk mendeteksi kesalahan sintaks dan praktik buruk.
   - Jalankan formatter dan linter sebelum melakukan commit:

   ```bash
   npm run lint
   npm run format
   ```

5. Server Compoennts
   - Gunakan Server Component secara default di Next.js.
   - Gunakan `"use client"` hanya jika benar-benar dibutuhkan, misalnya untuk interaksi UI.

---

## 📏 Peraturan Pengembangan

1. Branching
   Setiap fitur atau perbaikan sebaiknya dibuat pada branch yang terpisah.

   ```bash
    git checkout -b feat/fitur-baru
   ```

2. Commit Message
   Gunakan format commit yang jelas dan konsisten:

   ```bash
    git commit -m "feat: tambah modul riwayat obat"
    git commit -m "fix: perbaiki validasi form pasien"
    git commit -m "chore: update dokumentasi README"
   ```

3. Pull Request
   - Jangan langsung push ke branch main.
   - Setiap perubahan wajib dibuat Pull Request.
   - PR wajib ditinjau bersama sebelum merge.

4. Keamanan
   - Jangan pernah menyimpan secret, token, atau kredensial di dalam repository.
   - Gunakan `.env.local` untuk konfigurasi lokal.
   - Jangan membagikan file `.env.local` ke publik atau ke pihak yang tidak berwenang.

5. Database
   - Semua perubahan skema database harus dilakukan melalui migrasi.
   - Jangan mengubah struktur tabel langsung melalui dashboard Supabase tanpa dokumentasi dan review.
   - Semua perubahan database harus tercatat di folder /supabase/migrations.

---

## ⚠️ Peringatan Penting

- Data pasien merupakan data sensitif. Jangan membagikan informasi pribadi pasien di forum, issue, pull request, atau media komunikasi lain yang tidak aman.
- Jangan pernah mengunggah file `.env.local`, `.env`, token, atau kredensial lain ke repository GitHub.
- Hindari menjalankan perintah yang dapat menghapus atau merusak data, seperti `npx supabase db reset`, `npx supabase db seed`, `npx supabase db push`, dll, ecuali Anda benar-benar memahami dampaknya dan telah mendapat persetujuan.
- Setiap perubahan skema database wajib disertai migrasi yang terdokumentasi dan dilakukan melalui review yang tepat.
- Pastikan untuk melakukan `git pull` sebelum memulai pengembangan guna menghindari konflik integrasi dan memastikan Anda bekerja pada versi proyek terbaru.
- Sebelum mengirimkan Pull Request, pastikan fitur telah diuji secara lokal dan tidak menimbulkan regresi pada sistem.
- Jangan melakukan perubahan pada file atau modul yang terkait dengan otorisasi, autentikasi, atau data pasien tanpa pemahaman yang memadai terhadap dampaknya.
