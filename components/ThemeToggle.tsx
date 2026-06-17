"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "1px solid rgba(201,168,76,0.35)",
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
        color: dark ? "#e8d8a0" : "#3a2a05",
        backdropFilter: "blur(8px)",
        // Counter-invert tombol ini biar warnanya tetap keliatan bener di light mode
        filter: dark ? "none" : "invert(1) hue-rotate(180deg)",
      }}
    >
      {dark ? (
        // Sun — di dark mode, klik buat ke light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2"  x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"/>
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
          <line x1="2"  y1="12" x2="5"  y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
          <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/>
          <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Moon — di light mode, klik buat ke dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}