"use client";

import { deletePasienAction } from "@/actions/pasien";
import { useState } from "react";
import { DeleteIcon } from "../asset/icons";

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
      title="Hapus Data Pasien"
      className="flex p-2 items-center bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
    >
      <DeleteIcon className="w-4 h-4" />
    </button>
  );
}
