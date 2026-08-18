"use client";

import { createObatAction } from "@/actions/obat";
import {
  cencelBtnClass,
  submitBtnClass,
  inputClass,
  selectClass,
} from "@/utils/classTailwind";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function TambahObatModal() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createObatAction(formData);

    if (!result.success) {
      setError(result.error);
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
    setError(null);
    formRef.current?.reset();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
      >
        + Tambah Obat
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tambah Obat
            </h3>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Obat *
                  </label>
                  <input
                    type="text"
                    name="nama_obat"
                    required
                    placeholder="Massukkan nama obat"
                    className={inputClass}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-600">
                    Informasi Tambahan
                  </h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dosis/mg
                  </label>
                  <input
                    type="number"
                    name="dosis"
                    placeholder="Contoh: 300, 150/75/400/275"
                    className={inputClass}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={2}
                    placeholder="Masukkan Deskripsi Obat"
                    className={inputClass}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                {/* Tombol Batal & Simpan seperti sebelumnya */}
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className={cencelBtnClass}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={submitBtnClass}
                >
                  {isLoading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
