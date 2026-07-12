"use client";

import { deletePasienAction } from "@/actions/pasien";
import { useState } from "react";

export default function DeletePasienButton({
  id_pasien,
  nama,
}: {
  id_pasien: number;
  nama: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `PERINGATAN!\n\nApakah Anda yakin ingin menghapus pasien "${nama}" secara permanen? Akun login pasien juga akan terhapus.`,
    );

    if (isConfirmed) {
      setIsDeleting(true);
      await deletePasienAction(id_pasien);
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
