"use client";

import { EpisodePengobatanData } from "@/types/episodePengobatan";
import { useState, useTransition } from "react";
import EditEpisodeModal from "./EditEpisodeModal";
import DeleteEpisodeButton from "./DeleteEpisodeButton";
import { EditIcon } from "../asset/icons";

export default function RiwayatSubRow({
  episode,
}: {
  episode: EpisodePengobatanData;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending] = useTransition();

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition">
      <td className="px-4 py-3">{episode.tipe_pasien}</td>
      <td className="px-4 py-3">{episode.tanggal_mulai}</td>
      <td className="px-4 py-3">{episode.tanggal_selesai || "-"}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${episode.status_episode === "aktif" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
        >
          {episode.status_episode}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center items-center gap-2">
          {episode.status_episode !== "aktif" && (
            <button
              onClick={() => setIsEditOpen(true)}
              disabled={isPending}
              title="Edit Episode"
              className="inline-flex p-2 items-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
            >
              <EditIcon className="w-4 h-4" />
            </button>
          )}
          <DeleteEpisodeButton episode={episode} />
        </div>

        <EditEpisodeModal
          episode={episode}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      </td>
    </tr>
  );
}
