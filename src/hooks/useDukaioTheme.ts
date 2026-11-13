import { useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";

export function useDukaioTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("dukaio-theme");
      if (saved === "dark" || saved === "light") return saved;
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const applyTheme = useCallback((newTheme: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const isDashboard = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
    if (newTheme === "dark" && isDashboard) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("dukaio-theme", newTheme);
      window.dispatchEvent(new CustomEvent("dukaio-theme-change", { detail: newTheme }));
    } catch {}
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dukaio-theme" && (e.newValue === "light" || e.newValue === "dark")) {
        applyTheme(e.newValue);
      }
    };
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail && customEvent.detail !== theme) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dukaio-theme-change", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dukaio-theme-change", handleCustom);
    };
  }, [theme, applyTheme]);

  return {
    theme,
    isDark: theme === "dark",
    setTheme: applyTheme,
    toggleTheme,
  };
}

