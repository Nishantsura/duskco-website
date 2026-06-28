import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-black px-6 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
        404
      </h1>
      <p className="mt-4 font-primary text-base font-light text-white/50">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-white px-10 py-3.5 font-primary text-[13px] font-bold tracking-[0.08em] text-white uppercase transition-all duration-200 hover:bg-white hover:text-black"
      >
        Back to Home
      </Link>
    </main>
  );
}
