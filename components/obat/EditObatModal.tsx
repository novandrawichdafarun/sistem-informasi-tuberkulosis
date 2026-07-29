"use client";

import { updateObatAction } from "@/actions/obat";
import { ObatData } from "@/types/obat";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EditIcon } from "../asset/icons";
import { cencelBtnClass, editBtnClass } from "@/utils/classTailwind";

interface EditObatModalProps {
  data: ObatData;
}

export default function EditObatModal({ data }: EditObatModalProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateObatAction(formData);

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
        title="Edit Obat"
        className="inline-flex p-2 items- justify-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
      >
        <EditIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tambah Obat
            </h3>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="id_obat" value={data.id_obat} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Nama Obat *
                  </label>
                  <input
                    type="text"
                    name="nama_obat"
                    required
                    defaultValue={data.nama_obat}
                    placeholder="Massukkan nama obat"
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Jenis Obat *
                  </label>
                  <select
                    name="jenis_obat"
                    required
                    defaultValue={data.jenis_obat ?? ""}
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Pilih Jenis Obat --</option>
                    <option value="KDT (Kombinasi Dosis Tetap)">
                      KDT (Kombinasi Dosis Tetap)
                    </option>
                    <option value="Tunggal">Tunggal</option>
                    <option value="Injeksi">Injeksi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Kategori Obat *
                  </label>
                  <select
                    name="kategori_obat"
                    required
                    defaultValue={data.kategori_obat ?? ""}
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Pilih Kategori Obat --</option>
                    <option value="Lini Pertama">Lini Pertama</option>
                    <option value="Lini Kedua">Lini Kedua</option>
                    <option value="Suplement">Suplement</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-600">
                    Informasi Tambahan
                  </h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Dosis/mg
                  </label>
                  <input
                    type="number"
                    name="dosis"
                    defaultValue={data.dosis || ""}
                    placeholder="Contoh: 300, 150/75/400/275"
                    className="w-full rounded border border-gray-300 px-3 p-2 text-sm focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    rows={2}
                    placeholder="Masukkan Deskripsi Obat"
                    defaultValue={data.deskripsi || ""}
                    className="w-full rounded border border-gray-300 px-3 p-2 text-sm focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-gray-100">
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
                  className={editBtnClass}
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
