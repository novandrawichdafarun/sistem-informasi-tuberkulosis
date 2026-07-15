"use client";

import { deletePemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { useTransition } from "react";

export default function DeletePemeriksaanButton({
  periksa,
}: {
  periksa: PemeriksaanKlinisData;
}) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Yakin ingin menghapus data pemeriksaan klinis ini?")) {
      startTransition(async () => {
        await deletePemeriksaanAction(periksa.id_periksa);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
