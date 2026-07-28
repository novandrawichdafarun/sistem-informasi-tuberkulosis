"use client";

import { deletePasienAction } from "@/actions/pasien";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";

export default function DeletePasienButton({
  id_pasien,
  nama,
}: {
  id_pasien: number;
  nama: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deletePasienAction(id_pasien);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus data pasien.");
      setIsDeleting(false);
      return;
    }
    setIsDeleting(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Hapus Data Pasien"
        className="flex p-2 items-center bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
      >
        <DeleteIcon className="w-4 h-4" />
      </button>

      <ConfirmDeleteModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        onConfirm={handleConfirm}
        isDeleting={isDeleting}
        title="Hapus Data Pasien"
        message={
          <>
            Apakah Anda yakin ingin menghapus pasien{" "}
            <span className="font-semibold text-gray-700">{nama}</span> secara
            permanen? Akun login pasien juga akan ikut terhapus.
          </>
        }
        errorMessage={error}
      />
    </>
  );
}
