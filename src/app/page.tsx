import { HeroSection } from "@/components/home/hero-section";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // /?join opens the waitlist straight away (linked from the access page).
  const { join } = await searchParams;

  return (
    <main>
      <HeroSection openWaitlist={join !== undefined} />
    </main>
  );
}
