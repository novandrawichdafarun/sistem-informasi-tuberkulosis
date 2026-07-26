"use client";

import { deleteDiagnosisAction } from "@/actions/diagnosis";
import { useTransition } from "react";

export default function DeleteDiagnosisButton({
  id_diagnosis,
}: {
  id_diagnosis: number;
}) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      window.confirm(
        "Yakin ingin menghapus data Diagnosis ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      startTransition(async () => {
        await deleteDiagnosisAction(id_diagnosis);
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
