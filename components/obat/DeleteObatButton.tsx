"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteObatAction } from "@/actions/obat";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";

export default function DeleteObatButton({
  id_obat,
  nama,
}: {
  id_obat: number;
  nama: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteObatAction(id_obat);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus obat.");
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
        title="Hapus Obat"
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
        title="Hapus Obat"
        message={
          <>
            Hapus obat{" "}
            <span className="font-semibold text-gray-700">{nama}</span> dari
            master obat?
          </>
        }
        errorMessage={error}
      />
    </>
  );
}
