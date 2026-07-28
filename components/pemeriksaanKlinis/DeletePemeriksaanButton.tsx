"use client";

import { deletePemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";

export default function DeletePemeriksaanButton({
  periksa,
}: {
  periksa: PemeriksaanKlinisData;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deletePemeriksaanAction(periksa.id_periksa);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus pemeriksaan klinis.");
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
        title="Hapus Pemeriksaan Klinis"
        className="inline-flex p-2 items-center bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
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
        title="Hapus Pemeriksaan Klinis"
        message="Yakin ingin menghapus data pemeriksaan klinis ini? Tindakan ini tidak dapat dibatalkan."
        errorMessage={error}
      />
    </>
  );
}
