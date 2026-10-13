import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-bg px-5 text-center text-ink">
      <p className="t-label text-ink-muted">404</p>
      <h1 className="t-title mt-4">This page doesn&apos;t exist</h1>
      <Link href="/" className="btn btn-outline mt-10">
        Back to home
      </Link>
    </main>
  );
}
