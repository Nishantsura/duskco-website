"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-[60px] items-center justify-between px-8">
          <span className="font-display text-sm font-bold tracking-[0.08em] text-white uppercase">
            DUSK&CO
          </span>
          <button onClick={onClose} aria-label="Close menu" className="text-white/60 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className={`flex flex-col gap-1 px-8 pt-8 ${open ? "stagger-children" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="animate-slide-in-left block font-primary text-[13px] font-bold tracking-[0.16em] text-white uppercase opacity-0 transition-colors hover:text-white/60 leading-tight py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Video */}
        <div className="mt-6 min-h-[120px] flex-1 overflow-hidden px-8">
          {open && (
            <video
              ref={videoRef}
              src="/videos/Hero video mobile.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full rounded-lg object-cover"
            />
          )}
        </div>

        {/* Footer — socials + email */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/duskandco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white transition-colors hover:text-white/60"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://snapchat.com/add/duskandco"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Snapchat"
              className="text-white transition-colors hover:text-white/60"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.206 1c1.734 0 3.238.683 4.476 2.03 1.046 1.14 1.58 2.502 1.636 4.166l.004.196c0 .425-.02.843-.063 1.246l-.035.297.075.04c.342.19.654.34.932.44l.12.04c.258.077.414.125.524.19a.87.87 0 0 1 .438.757c0 .36-.244.655-.73.888-.297.14-.646.252-1.042.336l-.174.034-.157.038c-.137.04-.222.07-.275.098-.135.075-.2.173-.25.375l-.02.1c-.02.145-.02.276.003.41.18.76.502 1.478.964 2.147.558.81 1.2 1.416 1.928 1.826l.15.082c.236.12.47.206.756.265a.472.472 0 0 1 .378.458c0 .3-.2.56-.597.774-.472.256-1.075.42-1.795.492-.12.014-.2.07-.25.15-.055.09-.08.183-.12.35l-.03.107a.622.622 0 0 1-.61.468c-.2 0-.417-.04-.68-.098a5.266 5.266 0 0 0-1.093-.134c-.287 0-.57.03-.85.086-.366.077-.696.236-1.077.52-.643.48-1.225.85-1.746 1.115-.606.31-1.2.467-1.77.467h-.08c-.57 0-1.164-.157-1.77-.467a8.458 8.458 0 0 1-1.746-1.115c-.38-.284-.71-.443-1.078-.52a4.32 4.32 0 0 0-.848-.086c-.39 0-.757.05-1.094.134-.262.06-.48.098-.68.098a.622.622 0 0 1-.61-.468l-.028-.107c-.042-.167-.066-.26-.12-.35-.053-.08-.132-.136-.252-.15-.72-.073-1.323-.236-1.795-.492-.397-.215-.597-.474-.597-.774a.472.472 0 0 1 .378-.458c.287-.06.52-.146.757-.265l.15-.082c.727-.41 1.37-1.017 1.927-1.826.462-.67.784-1.387.964-2.148.024-.133.024-.264.004-.41l-.02-.1c-.05-.2-.116-.3-.25-.374-.054-.03-.14-.06-.276-.1l-.157-.037-.174-.034c-.396-.084-.745-.196-1.042-.336-.486-.233-.73-.528-.73-.888a.87.87 0 0 1 .438-.758c.11-.064.266-.112.524-.19l.12-.04c.278-.098.59-.248.932-.44l.075-.04-.035-.296a14.48 14.48 0 0 1-.063-1.247l.004-.196c.057-1.664.59-3.026 1.636-4.166C8.968 1.683 10.472 1 12.206 1z" />
              </svg>
            </a>
          </div>

          <a
            href="mailto:help@dusk.co"
            className="mt-3 flex items-center gap-2 font-primary text-[11px] font-light tracking-[0.06em] text-white/40 transition-colors hover:text-white/70"
          >
            <Mail size={13} strokeWidth={1.5} />
            help@dusk.co
          </a>

          <p className="mt-4 font-primary text-[10px] font-light tracking-[0.1em] text-white/25 uppercase">
            Wear the difference.
          </p>
        </div>
      </div>
    </>
  );
}
