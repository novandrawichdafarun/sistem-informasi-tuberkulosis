"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updatePasienAction } from "@/actions/pasien";
import { PasienData } from "@/types/pasien";

export default function EditPasienModal({ pasien }: { pasien: PasienData }) {
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
    const result = await updatePasienAction(formData);

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
      <button
        onClick={() => setIsOpen(true)}
        className="text-yellow-600 hover:text-yellow-900 mx-2"
      >
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative text-left text-gray-600 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Pasien: {pasien.nama_lengkap}
                </h3>
                <p className="text-sm text-gray-500">
                  Perbarui data pasien dan akun login terkait.
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
                <input
                  type="hidden"
                  name="id_pasien"
                  value={pasien.id_pasien}
                />
                <input type="hidden" name="id_user" value={pasien.id_user} />

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
                        defaultValue={pasien.nama_lengkap}
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
                        defaultValue={pasien.nik}
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
                        defaultValue={pasien.no_rm}
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
                        defaultValue={pasien.users?.email}
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Kosongkan jika tidak diganti"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

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
                        defaultValue={pasien.tanggal_lahir}
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
                        defaultValue={pasien.jenis_kelamin}
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
                        defaultValue={pasien.alamat}
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
                        defaultValue={pasien.no_telp}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Klinis Fisik Awal
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        type="number"
                        name="tinggi_badan_awal"
                        defaultValue={pasien.tinggi_badan_awal || ""}
                        min="0"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        name="berat_badan_awal"
                        defaultValue={pasien.berat_badan_awal || ""}
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

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
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
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
