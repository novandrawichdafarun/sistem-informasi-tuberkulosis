"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteObatAction } from "@/actions/obat";

export default function DeleteObatButton({
  id_obat,
  nama,
}: {
  id_obat: number;
  nama: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Hapus obat "${nama}" dari master?`)) return;
    setIsDeleting(true);
    const res = await deleteObatAction(id_obat);
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
      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
    >
      {isDeleting ? "..." : "Hapus"}
    </button>
  );
}
