"use client";

import { getExportDataAction } from "@/actions/export";
import { generateAndDownloadExcel } from "@/libs/excelGenerator";
import { todayISO } from "@/utils/date";
import { useState } from "react";

export default function ExportDataWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayISO);
  const [modules, setModules] = useState({
    pasienEpisode: true,
    klinis: true,
    lab: true,
    diagnosis: true,
    makan: true,
    obat: true,
  });

  const handleToggleModule = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Tanggal mulai dan akhir wajib diisi.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await getExportDataAction({
        startDate,
        endDate,
        selectedModules: modules,
      });

      if (res.success === false || !res.data) {
        setError("Gagal mengambil data dari server.");
        setIsLoading(false);
        return;
      }

      await generateAndDownloadExcel(res.data, startDate, endDate);
      setIsOpen(false);
    } catch (error) {
      setError(`Terjadi kesalahan sistem saat memproses file Excel.\n${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        {isOpen ? "Tutup Panel Ekspor" : "Ekspor Data (Excel)"}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-10 w-[320px] sm:w-100 rounded-xl border border-brand-200 bg-white p-5 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold text-brand-950">
            Filter Ekspor Data
          </h3>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                Mulai*
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                Akhir*
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-xs text-slate-500">
              Pilih Modul Data
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(modules).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={modules[key as keyof typeof modules]}
                    onChange={() =>
                      handleToggleModule(key as keyof typeof modules)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            {isLoading ? "Memproses Data..." : "Unduh File Excel"}
          </button>
        </div>
      )}
    </div>
  );
}
