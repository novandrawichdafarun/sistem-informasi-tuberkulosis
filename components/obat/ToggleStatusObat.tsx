"use client";

import { toggleStatusObatAction } from "@/actions/obat";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ToggleStatusObatProps {
  id_obat: number;
  status: boolean;
}

export default function ToggleStatusObat({
  id_obat,
  status,
}: ToggleStatusObatProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (id: number, currentStatus: boolean) => {
    setIsLoading(true);
    const result = await toggleStatusObatAction(id, !currentStatus);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      console.log(error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsLoading(false);
      formRef.current?.reset();
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={status}
          onChange={() => handleToggle(id_obat, status)}
          disabled={isLoading}
        />
        <span
          className={`relative h-6 w-11 rounded-full transition-colors ${
            status ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              status ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </label>

      <span
        className={`text-sm font-medium ${
          status ? "text-green-600" : "text-red-600"
        }`}
      >
        {status ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}
