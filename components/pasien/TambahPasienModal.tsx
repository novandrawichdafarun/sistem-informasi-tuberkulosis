"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPasienAction } from "@/actions/pasien";
import {
  USIA_OPTIONS,
  PENDIDIKAN_OPTIONS,
  PEKERJAAN_OPTIONS,
  PENDAPATAN_OPTIONS,
} from "@/utils/pasienOptions";

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function SelectField({
  label,
  name,
  options,
  required = true,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && "*"}
      </label>
      <select
        name={name}
        required={required}
        className={`${inputClass} bg-white`}
      >
        <option value="">-- Pilih --</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

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
    } else {
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
        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        + Daftarkan Pasien Baru
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
                {/* Akun & Identitas */}
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
                        className={inputClass}
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
                        className={inputClass}
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
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Demografi */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Data Demografi (Bisa Pilih atau Ketik Manual)
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                    {/* USIA */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jenis Kelamin *
                      </label>
                      <select
                        name="jenis_kelamin"
                        required
                        className={`${inputClass} bg-white`}
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <SelectField
                      label="Kelompok Usia"
                      name="usia"
                      options={USIA_OPTIONS}
                    />
                    <SelectField
                      label="Pendidikan"
                      name="pendidikan"
                      options={PENDIDIKAN_OPTIONS}
                    />
                    <SelectField
                      label="Pekerjaan"
                      name="pekerjaan"
                      options={PEKERJAAN_OPTIONS}
                    />
                    <SelectField
                      label="Pendapatan"
                      name="pendapatan"
                      options={PENDAPATAN_OPTIONS}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input type="tel" name="no_telp" className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Domisili *
                      </label>
                      <textarea
                        name="domisili"
                        rows={2}
                        required
                        className={inputClass}
                      ></textarea>
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
