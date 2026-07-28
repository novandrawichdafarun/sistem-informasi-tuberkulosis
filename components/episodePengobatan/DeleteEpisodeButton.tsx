"use client";

import { hapusEpisodeAction } from "@/actions/episodePengobatan";
import { EpisodePengobatanData } from "@/types/episodePengobatan";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteIcon } from "../asset/icons";
import ConfirmDeleteModal from "../molecules/ConfirmDeleteModal";

export default function DeleteEpisodeButton({
  episode,
}: {
  episode: EpisodePengobatanData;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    const res = await hapusEpisodeAction(episode.id_episode);
    if (res && !res.success) {
      setError(res.error ?? "Gagal menghapus episode pengobatan.");
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
        title="Hapus Episode Pengobatan"
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
        title="Hapus Episode Pengobatan"
        message="Apakah Anda yakin ingin menghapus episode pengobatan ini? Data yang terhapus tidak dapat dikembalikan."
        errorMessage={error}
      />
    </>
  );
}
