import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section>
      <div className="max-w-xl mx-auto text-center py-10">
        <p className="font-display text-7xl font-semibold text-leaf-700 dark:text-leaf-400">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">This furrow leads nowhere</h1>
        <p className="mt-3 text-ink-soft">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/"><Button>Go home</Button></Link>
          <Link href="/calculator"><Button variant="secondary">Open calculator</Button></Link>
        </div>
      </div>
    </Section>
  );
}
