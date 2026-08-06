"use client";

import { useEffect, useRef } from "react";

/**
 * Lapisan "spotlight" — cahaya lembut yang mengikuti pointer (mouse di desktop,
 * sentuhan jari di mobile) memakai Pointer Events. Posisi ditulis ke CSS variable
 * lewat ref (tanpa re-render React) dan digerakkan via requestAnimationFrame.
 * Nonaktif otomatis bila pengguna mengaktifkan "reduce motion".
 */
export default function PointerSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hormati preferensi hemat-gerak.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const move = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--x", `${x}px`);
        el.style.setProperty("--y", `${y}px`);
        el.style.setProperty("--o", "1");
      });
    };

    const hide = () => el.style.setProperty("--o", "0");
    // Di mobile: sembunyikan lagi saat jari diangkat; di desktop (mouse) biarkan.
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") hide();
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointerleave", hide);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{
        opacity: "var(--o, 0)",
        background:
          "radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(52,159,118,0.20), rgba(87,209,178,0.08) 40%, transparent 72%)",
      }}
    />
  );
}
