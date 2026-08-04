"use client";

import { updateUserAction } from "@/actions/user";
import { UserData } from "@/types/user";
import {
  cencelBtnClass,
  editBtnClass,
  inputClass,
} from "@/utils/classTailwind";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EditIcon } from "../asset/icons";

export default function EditUserModal({ user }: { user: UserData }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateUserAction(formData);

    if (!result.success) {
      setErrorMessage(result.error);
      setIsLoading(false);
    } else {
      setIsOpen(false);
      setIsLoading(false);
      router.refresh();
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setErrorMessage(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Edit Data user"
        className="flex p-2 items-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
      >
        <EditIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative text-left text-gray-600 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Akun Admin: {user.email}
                </h3>
                <p className="text-sm text-gray-500">Perbarui data User.</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-6">
              {errorMessage && (
                <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="id_user" value={user.id_user} />

                {/* --- INFO AKUN & IDENTITAS --- */}
                <div className="grid grid-cols-1 gap-y-4 gap-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user.email}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Kosongkan jika tidak diganti"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Konfirmasi Kata Sandi
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Kosongkan jika tidak diganti"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-x-3 rounded-b-xl border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className={cencelBtnClass}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={editBtnClass}
                  >
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
