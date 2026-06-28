import Link from "next/link";
import Image from "next/image";

interface MegaMenuProps {
  onClose: () => void;
}

const COLLECTION_LINKS = [
  { label: "ALL PRODUCTS", href: "/collections/all" },
  { label: "FEATURED", href: "/collections/frontpage" },
  { label: "STAGE 1", href: "/collections/stage-1" },
];

const EDITORIAL_CARDS = [
  {
    title: "NEW ARRIVALS",
    href: "/collections/frontpage",
    image: null as string | null,
  },
  {
    title: "ESSENTIALS",
    href: "/collections/frontpage",
    image: null as string | null,
  },
];

export function MegaMenu({ onClose }: MegaMenuProps) {
  return (
    <div
      className="w-full"
      onMouseLeave={onClose}
    >
      {/* Gradient fade from black */}
      <div className="bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] gap-16 px-6 py-12 sm:px-10">
          {/* Left — Collection links */}
          <nav className="flex flex-col gap-5 pt-2">
            {COLLECTION_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="font-primary text-sm font-light tracking-[0.05em] text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — Editorial image cards */}
          <div className="flex flex-1 justify-end gap-4">
            {EDITORIAL_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                onClick={onClose}
                className="group block w-[220px]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/10">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-primary text-[10px] tracking-[0.2em] text-white/20 uppercase">
                        Editorial
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 font-primary text-[11px] font-bold tracking-[0.12em] text-white/70 uppercase transition-colors group-hover:text-white">
                  {card.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
