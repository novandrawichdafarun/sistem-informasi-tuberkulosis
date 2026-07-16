// components/pemeriksaanLab/DeleteLabButton.tsx
"use client";

import { deletePemeriksaanLabAction } from "@/actions/pemeriksaanLab";
import { useTransition } from "react";

export default function DeleteLabButton({ id_tes }: { id_tes: number }) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      window.confirm(
        "Yakin ingin menghapus data pemeriksaan lab ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      startTransition(async () => {
        await deletePemeriksaanLabAction(id_tes);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 text-xs font-medium disabled:text-red-300 disabled:cursor-not-allowed transition-colors"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
