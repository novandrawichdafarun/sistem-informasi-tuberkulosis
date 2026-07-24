"use client";

import { deleteObatAction } from "@/actions/obat";
import { useState } from "react";

interface DeleteObatButtonProps {
  id_obat: number;
  nama_obat: string;
}

export default function DeleteObatButton({
  id_obat,
  nama_obat,
}: DeleteObatButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `PERINGATAN!\n\nApakah Anda yakin ingin menghapus pasien "${nama_obat}" secara permanen? Akun login pasien juga akan terhapus.`,
    );

    if (isConfirmed) {
      setIsDeleting(true);
      await deleteObatAction(id_obat);
      setIsDeleting(false);
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
