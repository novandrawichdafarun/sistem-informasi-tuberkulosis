import { ComprehensiveExportData } from "@/types/eksport";

export const generateAndDownloadExcel = async (
  data: ComprehensiveExportData,
  startDate: string,
  endDate: string,
) => {
  // Mengimpor pustaka secara dinamis hanya saat fungsi ini dieksekusi
  const { utils, writeFile } = await import("xlsx");

  // Membuat buku kerja (workbook) kosong
  const workbook = utils.book_new();

  // Menambahkan sheet secara dinamis berdasarkan data yang tersedia
  if (data.pasienEpisode && data.pasienEpisode.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.pasienEpisode),
      "Pasien dan Episode",
    );
  }

  if (data.klinis && data.klinis.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.klinis),
      "Pemeriksaan Klinis",
    );
  }

  if (data.lab && data.lab.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.lab),
      "Pemeriksaan Lab",
    );
  }

  if (data.diagnosis && data.diagnosis.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.diagnosis),
      "Diagnosis",
    );
  }

  if (data.makan && data.makan.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.makan),
      "Laporan Makan",
    );
  }

  if (data.obat && data.obat.length > 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet(data.obat),
      "Kepatuhan Obat",
    );
  }

  if (workbook.SheetNames.length === 0) {
    utils.book_append_sheet(
      workbook,
      utils.json_to_sheet([{ Pesan: "Tidak ada data pada rentang waktu ini" }]),
      "Data Kosong",
    );
  }

  // Memicu unduhan file di browser pengguna
  const fileName = `Ekspor_Data_Medis_${startDate}_ke_${endDate}.xlsx`;
  writeFile(workbook, fileName);
};
