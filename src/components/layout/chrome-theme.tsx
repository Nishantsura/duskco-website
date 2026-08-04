"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Global light/dark theme. The whole site is token-driven (bg-bg / text-ink /
 * border-line / bg-accent in globals.css), so flipping this one attribute on
 * <html data-theme> re-themes every page with no per-component work and no
 * flash — a blocking inline script in the layout sets the stored theme before
 * first paint, and this provider just keeps React state in sync + persists it.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "duskco-theme";

interface ChromeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  /** True while the active page wants full-viewport section snapping (the drop). */
  snap: boolean;
  setSnap: (v: boolean) => void;
}

const Ctx = createContext<ChromeCtx>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
  snap: false,
  setSnap: () => {},
});

export function useChromeTheme() {
  return useContext(Ctx);
}

export function ChromeThemeProvider({
  initialTheme = "dark",
  children,
}: {
  initialTheme?: Theme;
  children: React.ReactNode;
}) {
  // Seeded from the theme cookie the server already read, so SSR + first client
  // render agree — no flash and no icon flicker.
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [snap, setSnap] = useState(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    // Cookie is the source of truth (read by the server on the next load);
    // localStorage is a belt-and-suspenders mirror.
    document.cookie = `${THEME_STORAGE_KEY}=${t};path=/;max-age=31536000;samesite=lax`;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      /* storage blocked — theme still applies for the session */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(
      document.documentElement.dataset.theme === "light" ? "dark" : "light"
    );
  }, [setTheme]);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("snap-page", snap);
    return () => el.classList.remove("snap-page");
  }, [snap]);

  return (
    <Ctx.Provider value={{ theme, toggle, setTheme, snap, setSnap }}>
      {children}
    </Ctx.Provider>
  );
}
