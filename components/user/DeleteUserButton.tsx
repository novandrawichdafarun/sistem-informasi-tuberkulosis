"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";
import { deleteUserAction } from "@/actions/user";

export default function DeleteUserButton({
  id_user,
  email,
}: {
  id_user: string;
  email: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await deleteUserAction(id_user);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus data user.");
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
        title="Hapus Data User"
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
        title="Hapus Data User"
        message={
          <>
            Apakah Anda yakin ingin menghapus User{" "}
            <span className="font-semibold text-gray-700">{email}</span> secara
            permanen?
          </>
        }
        errorMessage={error}
      />
    </>
  );
}
