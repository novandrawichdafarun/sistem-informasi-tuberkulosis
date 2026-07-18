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
            onClick={closeModal} // Tutup jika area luar diklik
          ></div>

          {/* Kotak Modal */}
          <div className="relative text-left text-gray-600 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Daftarkan Pasien Baru
                </h3>
                <p className="text-sm text-gray-500">
                  Pasien otomatis akan dibuatkan akun login.
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
                {/* --- INFORMASI DASAR --- */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Info Akun & Identitas
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
                        NIK *
                      </label>
                      <input
                        type="text"
                        name="nik"
                        required
                        maxLength={16}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nomor RM (Opsional)
                      </label>
                      <input
                        type="text"
                        name="no_rm"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Input Email & Password untuk Akun */}
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

                {/* --- DATA DEMOGRAFI --- */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Demografi
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Kelamin *
                      </label>
                      <select
                        name="jenis_kelamin"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="">-- Pilih --</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Alamat Lengkap
                      </label>
                      <textarea
                        name="alamat"
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="no_telp"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
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
