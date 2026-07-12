export function hitungUmur(tanggalLahir: string): number {
  const hariIni = new Date();
  const tglLahir = new Date(tanggalLahir);

  let umur = hariIni.getFullYear() - tglLahir.getFullYear();
  const selisihBulan = hariIni.getMonth() - tglLahir.getMonth();

  if (
    selisihBulan < 0 ||
    (selisihBulan === 0 && hariIni.getDate() < tglLahir.getDate())
  ) {
    umur--;
  }

  return umur;
}
