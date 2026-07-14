"use client";

import { hapusEpisodeAction } from "@/actions/episodePengobatan";
import { EpisodePengobatanData } from "@/types/episodePengobatan";
import { useTransition } from "react";

export default function DeleteEpisodeButton({
  episode,
}: {
  episode: EpisodePengobatanData;
}) {
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus episode pengobatan ini? Data yang terhapus tidak dapat dikembalikan.",
      )
    ) {
      startTransition(async () => {
        await hapusEpisodeAction(episode.id_episode);
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
