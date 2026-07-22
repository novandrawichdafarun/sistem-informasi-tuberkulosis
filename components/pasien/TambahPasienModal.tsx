"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPasienAction } from "@/actions/pasien";

export default function TambahPasienModal() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createPasienAction(formData);

    if (!result.success) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsOpen(false);
      setIsLoading(false);
      formRef.current?.reset();

      router.refresh();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setErrorMessage(null);
    formRef.current?.reset();
  };

  return (
    <>
      {/* Tombol Pemicu Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        + Daftarkan Pasien Baru
      </button>

      {/* Tampilan Modal (Hanya muncul jika isOpen === true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          {/* Latar Belakang Gelap (Backdrop) */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Kotak Modal */}
          <div className="relative text-left bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Daftarkan Pasien Baru
                </h3>
                <p className="text-sm text-gray-500">
                  Pasien otomatis akan dibuatkan akun login sistem.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-4">
              {errorMessage && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* --- INFORMASI AKUN & IDENTITAS --- */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Info Akun & Identitas Dasar
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Alamat Email Login *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kata Sandi Awal *
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="Minimal 6 karakter"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* --- DATA DEMOGRAFI (BISA KETIK MANUAL ATAU PILIH OPSI) --- */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Data Demografi (Bisa Pilih atau Ketik Manual)
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    {/* USIA */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Usia / Kategori Usia *
                      </label>
                      <input
                        type="text"
                        name="usia"
                        list="list-usia"
                        required
                        placeholder="Pilih atau ketik usia..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <datalist id="list-usia">
                        <option value="Balita (< 5 tahun)" />
                        <option value="Anak-anak (5-11 tahun)" />
                        <option value="Remaja (12-25 tahun)" />
                        <option value="Dewasa (26-45 tahun)" />
                        <option value="Lansia (56-65 tahun)" />
                        <option value="Manula (> 65 tahun)" />
                      </datalist>
                    </div>

                    {/* JENIS KELAMIN (Tetap Select karena hanya ada 2 pilihan pasti) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Kelamin *
                      </label>
                      <select
                        name="jenis_kelamin"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    {/* DOMISILI */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Domisili *
                      </label>
                      <input
                        type="text"
                        name="domisili"
                        required
                        placeholder="Contoh: Surabaya"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* NOMOR TELEPON */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="no_telp"
                        placeholder="Contoh: 081234567890"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* PENDIDIKAN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pendidikan Terakhir *
                      </label>
                      <input
                        type="text"
                        name="pendidikan"
                        list="list-pendidikan"
                        required
                        placeholder="Pilih atau ketik pendidikan..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <datalist id="list-pendidikan">
                        <option value="SD" />
                        <option value="SMP" />
                        <option value="SMA" />
                        <option value="Diploma (D1/D2/D3/D4)" />
                        <option value="Sarjana (S1)" />
                        <option value="Magister (S2)" />
                        <option value="Doktor (S3)" />
                      </datalist>
                    </div>

                    {/* PEKERJAAN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pekerjaan *
                      </label>
                      <input
                        type="text"
                        name="pekerjaan"
                        list="list-pekerjaan"
                        required
                        placeholder="Pilih atau ketik pekerjaan..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <datalist id="list-pekerjaan">
                        <option value="Ibu Rumah Tangga" />
                        <option value="Wirausaha" />
                        <option value="PNS/ASN" />
                        <option value="TNI/Polri" />
                        <option value="Pegawai BUMN/BUMD" />
                        <option value="Karyawan Swasta" />
                        <option value="Buruh" />
                        <option value="Pensiunan" />
                      </datalist>
                    </div>

                    {/* PENDAPATAN */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pendapatan / Penghasilan *
                      </label>
                      <input
                        type="text"
                        name="pendapatan"
                        list="list-pendapatan"
                        required
                        placeholder="Pilih atau ketik kisaran pendapatan..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <datalist id="list-pendapatan">
                        <option value="Dibawah rata-rata (< 1.5jt)" />
                        <option value="Kelas Bawah (1.5jt - 3jt)" />
                        <option value="Kelas Menengah-Bawah (3jt - 5jt)" />
                        <option value="Kelas Menengah (5jt - 10jt)" />
                        <option value="Kelas Menengah Atas (10jt - 20jt)" />
                        <option value="Kelas Atas (> 20jt)" />
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Bagian Tombol */}
                <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-x-3 rounded-b-xl border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan & Daftarkan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
