export interface MonthlyPoint {
  key: string; // "YYYY-MM"
  label: string; // "Jan", "Feb", ...
  value: number;
}

export interface StatistikAdmin {
  totalPasien: number;
  pasienAktif: number;
  rataKepatuhanBulanIni: number; // persen
  pasienBaruBulanIni: number;
  bulanIniLabel: string; // "Juli 2026"

  distribusi: {
    baik: number; // >= 80%
    cukup: number; // 60 - 79%
    rendah: number; // < 60%
    totalDinilai: number;
  };

  trenKepatuhan: MonthlyPoint[]; // 6 bulan, value = persen kepatuhan
  pasienBaruPerBulan: MonthlyPoint[]; // 6 bulan, value = jumlah pasien baru
  pasienAktifPerBulan: MonthlyPoint[]; // 6 bulan, value = jumlah pasien aktif
}
