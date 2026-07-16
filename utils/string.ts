import z from "zod";

export const optionalString = (maxLength: number) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .max(maxLength, `Maksimal ${maxLength} karakter`)
      .optional(),
  );
