"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";

/** Fixed navbar height in px — the header renders at this height. */
export const NAVBAR_HEIGHT = 44;

/** Past this many px from the top the bar may hide. Above it, it always shows. */
const HIDE_AFTER = 80;
/** Upward travel, in px, needed to bring a hidden bar back. Filters out snap
 *  settling, rubber-band bounces and trackpad jitter. */
const REVEAL_AFTER = 12;
/** Past this many px from the top the bar counts as scrolled (goes solid). */
const SCROLLED_AT = 50;

interface NavVisibility {
  /** True after the user scrolls down, until they scroll back up — navbar (and dock) hidden. */
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
  const pathname = usePathname();

  // Re-run per page, so every new page starts with the bar showing even when
  // no scroll event fires on arrival.
  useEffect(() => {
    // Overscroll (iOS rubber band) reports positions past either end; clamp
    // so a bounce never reads as a change of direction.
    function currentY() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return Math.min(Math.max(window.scrollY, 0), Math.max(max, 0));
    }

    let lastY = currentY();
    let upTravel = 0;
    let frame = 0;

    function update() {
      frame = 0;
      const y = currentY();
      const dy = y - lastY;
      lastY = y;
      setScrolled(y > SCROLLED_AT);

      if (y <= HIDE_AFTER) {
        upTravel = 0;
        setHidden(false);
      } else if (dy > 0) {
        upTravel = 0;
        setHidden(true);
      } else if (dy < 0) {
        upTravel -= dy;
        if (upTravel >= REVEAL_AFTER) setHidden(false);
      }
    }

    function arrive() {
      setScrolled(currentY() > SCROLLED_AT);
      setHidden(false);
    }

    // One state update per frame, however fast the scroll events come.
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    arrive();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <Ctx.Provider value={{ hidden, scrolled }}>{children}</Ctx.Provider>;
}
