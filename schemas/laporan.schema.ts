import { optionalString } from "@/utils/string";
import z from "zod";

export const laporanObatSchema = z
  .object({
    id_jadwal: z.coerce.number().positive("ID Jadwal tidak valid"),
    status_input: z.enum(["diminum", "ditunda"]),
    catatan_kepatuhan: optionalString(255),
    reported_by: z.enum(["pasien", "pendamping", "nakes"]),
  })
  .refine(
    (data) => {
      if (data.status_input === "ditunda") {
        return (
          data.catatan_kepatuhan !== undefined &&
          data.catatan_kepatuhan.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Alasan wajib diisi jika obat ditunda",
      path: ["catatan_kepatuhan"],
    },
  );
