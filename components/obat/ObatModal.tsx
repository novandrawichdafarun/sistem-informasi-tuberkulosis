"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createObatAction, updateObatAction } from "@/actions/obat";
import { ObatData } from "@/types/obat";

const inputClass =
  "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const JENIS = ["Tablet", "Kapsul", "Sirup", "Injeksi", "Lainnya"];
const KATEGORI = ["OAT Lini 1", "OAT Lini 2", "Suplemen", "Lainnya"];

export default function ObatModal({ obat }: { obat?: ObatData }) {
  const isEdit = !!obat;
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
    const result = isEdit
      ? await updateObatAction(formData)
      : await createObatAction(formData);

    if (!result.success) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else {
      setIsOpen(false);
      setIsLoading(false);
      if (!isEdit) formRef.current?.reset();
      router.refresh();
    }
  };

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-yellow-600 hover:text-yellow-900 mx-2"
        >
          Edit
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          + Tambah Obat
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="relative text-left text-gray-600 bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {isEdit ? `Edit Obat: ${obat!.nama_obat}` : "Tambah Obat Baru"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-4">
              {errorMessage && (
                <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {isEdit && (
                  <input type="hidden" name="id_obat" value={obat!.id_obat} />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Obat *
                  </label>
                  <input
                    type="text"
                    name="nama_obat"
                    required
                    defaultValue={obat?.nama_obat ?? ""}
                    placeholder="cth: Rifampisin"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Jenis
                    </label>
                    <select
                      name="jenis_obat"
                      defaultValue={obat?.jenis_obat ?? ""}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="">-- Pilih --</option>
                      {JENIS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <select
                      name="kategori_obat"
                      defaultValue={obat?.kategori_obat ?? ""}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="">-- Pilih --</option>
                      {KATEGORI.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dosis
                    </label>
                    <input
                      type="text"
                      name="dosis"
                      defaultValue={obat?.dosis ?? ""}
                      placeholder="cth: 450mg"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="is_active"
                      defaultValue={obat ? String(obat.is_active) : "true"}
                      className={`${inputClass} bg-white`}
                    >
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={2}
                    defaultValue={obat?.deskripsi ?? ""}
                    className={inputClass}
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-x-3 pt-2 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
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
                    {isLoading ? "Menyimpan..." : "Simpan"}
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
