"use client";

import { type ObatData, type ObatFormValues } from "@/types/obat";
import { inputClass } from "@/utils/classTailwind";
import { getDailyFrequencyCount } from "@/utils/date";
import { FREKUENSI } from "@/utils/obat";

const DEFAULT_JAM = "09:00";

type Props = {
  obat: ObatData;
  selected: boolean;
  values: ObatFormValues;
  today: string;
  defaultEnd: string;
  onToggle: () => void;
  onChange: (field: keyof ObatFormValues, value: string | string[]) => void;
};

function normalizeJamValues(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value.length ? value : [DEFAULT_JAM];
  if (!value) return [DEFAULT_JAM];

  const list = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return list.length ? list : [DEFAULT_JAM];
}

export default function ObatItemForm({
  obat,
  selected,
  values,
  today,
  defaultEnd,
  onToggle,
  onChange,
}: Props) {
  const row = {
    jumlah_per_minum: values?.jumlah_per_minum ?? "1",
    frekuensi_minum: values?.frekuensi_minum ?? "1x sehari",
    aturan_pakai: values?.aturan_pakai ?? "",
    tanggal_mulai_obat: values?.tanggal_mulai_obat ?? today,
    tanggal_selesai_obat: values?.tanggal_selesai_obat ?? defaultEnd,
    jam_jadwal: normalizeJamValues(values?.jam_jadwal),
  };

  const jamCount = getDailyFrequencyCount(row.frekuensi_minum);
  const jamInputs = Array.from(
    { length: jamCount },
    (_, index) => row.jam_jadwal[index] ?? DEFAULT_JAM,
  );

  const updateJam = (index: number, jam: string) => {
    const next = [...jamInputs];
    next[index] = jam;
    onChange("jam_jadwal", next);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        <div className="grow">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{obat.nama_obat}</span>
            <span className="text-xs text-gray-400">
              {obat.dosis || ""}
              {obat.jenis_obat ? ` · ${obat.jenis_obat}` : ""}
            </span>
          </div>
          {!obat.is_active && (
            <div className="text-[10px] text-amber-600">nonaktif</div>
          )}
        </div>
      </label>

      {selected && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Jumlah / Minum *
              </label>
              <input
                type="number"
                min={0.25}
                step={0.25}
                value={row.jumlah_per_minum}
                required
                onChange={(e) => onChange("jumlah_per_minum", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Frekuensi Minum *
              </label>
              <select
                value={row.frekuensi_minum}
                required
                onChange={(e) => onChange("frekuensi_minum", e.target.value)}
                className={inputClass}
              >
                {FREKUENSI.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Mulai Obat *
              </label>
              <input
                type="date"
                value={row.tanggal_mulai_obat}
                required
                onChange={(e) => onChange("tanggal_mulai_obat", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Selesai Obat *
              </label>
              <input
                type="date"
                value={row.tanggal_selesai_obat}
                required
                onChange={(e) =>
                  onChange("tanggal_selesai_obat", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <label className="block text-xs font-medium text-gray-600">
              Jam Jadwal ({jamCount}x sehari) *
            </label>

            {jamInputs.map((jam, index) => (
              <input
                key={index}
                type="time"
                value={jam}
                required
                onChange={(e) => updateJam(index, e.target.value)}
                className={inputClass}
              />
            ))}

            <p className="text-[11px] text-slate-500">
              Gunakan {jamCount} kolom jam. Default jam pertama adalah 09:00.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">
              Aturan Pakai *
            </label>
            <input
              type="text"
              value={row.aturan_pakai}
              placeholder="Contoh: Sesudah makan pagi"
              required
              onChange={(e) => onChange("aturan_pakai", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
