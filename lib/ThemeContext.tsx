"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  dark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  dark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("msj-theme") as Theme | null;
    const initial = saved === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const html = document.documentElement;
    if (t === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("msj-theme", next);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, dark: theme === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}