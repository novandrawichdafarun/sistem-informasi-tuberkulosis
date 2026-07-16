import { ActionResponse } from "@/types/action";

export function handleActionError<T = void>(
  error: unknown,
  fallbackMessage: string = "Terjadi kesalahan internal server",
): ActionResponse<T> {
  console.error("[SERVER ACTION ERROR]:", error);

  return {
    success: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}

export function handleServiceError<T = void>(
  error: unknown,
  fallbackMessage: string = "Terjadi kesalahan internal service",
): ActionResponse<T> {
  console.error("[SYSTEM ERROR]:", error);

  return { success: false, error: fallbackMessage };
}
