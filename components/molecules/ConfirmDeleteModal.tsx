"use client";

import { DeleteIcon } from "../asset/icons";

// Modal konfirmasi hapus reusable — menggantikan window.confirm/alert
// agar konsisten dengan modal Edit & Tambah.
export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Hapus Data",
  message,
  confirmLabel = "Hapus",
  errorMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  errorMessage?: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={isDeleting ? undefined : onClose}
      />

      <div className="relative text-left bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
              <DeleteIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <div className="mt-1 text-sm text-gray-500">{message}</div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-md bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-x-3 rounded-b-xl border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-red-400"
          >
            {isDeleting ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
