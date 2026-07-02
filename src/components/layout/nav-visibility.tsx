"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

/** Fixed navbar height in px — the header renders at this height. */
export const NAVBAR_HEIGHT = 44;

interface NavVisibility {
  /** True while the user is actively scrolling down — navbar (and dock) hidden. */
  hidden: boolean;
  /** True once scrolled past the very top. */
  scrolled: boolean;
}

const Ctx = createContext<NavVisibility>({ hidden: false, scrolled: false });

export function useNavVisibility() {
  return useContext(Ctx);
}

export function NavVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let stopTimer: ReturnType<typeof setTimeout> | null = null;

    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 50);

      if (y > 80 && y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }
      lastY = y;

      // When scrolling stops, bring everything back.
      if (stopTimer) clearTimeout(stopTimer);
      stopTimer = setTimeout(() => setHidden(false), 180);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (stopTimer) clearTimeout(stopTimer);
    };
  }, []);

  return <Ctx.Provider value={{ hidden, scrolled }}>{children}</Ctx.Provider>;
}
