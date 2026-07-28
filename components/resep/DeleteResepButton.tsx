"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteResepAction } from "@/actions/resep";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";

export default function DeleteResepButton({ id_resep }: { id_resep: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteResepAction(id_resep);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus resep.");
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
        title="Hapus Resep"
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
        title="Hapus Resep"
        message="Hapus resep ini beserta seluruh jadwal & laporan minum obatnya? Tindakan ini tidak dapat dibatalkan."
        errorMessage={error}
      />
    </>
  );
}
