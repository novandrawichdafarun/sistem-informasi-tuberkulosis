"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteResepAction } from "@/actions/resep";

export default function DeleteResepButton({ id_resep }: { id_resep: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Hapus resep ini beserta seluruh jadwal & laporan minum obatnya?",
      )
    )
      return;
    setIsDeleting(true);
    const res = await deleteResepAction(id_resep);
    setIsDeleting(false);
    if (!res.success) {
      alert(res.error);
      return;
    }
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 text-xs font-medium disabled:text-gray-400"
    >
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
