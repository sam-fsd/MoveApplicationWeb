import Link from "next/link";

/**
 * Placeholder. The real landing page is Phase 2 and must match
 * docs/screens/01_landing_home.png.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-container-max flex-col items-start justify-center gap-space-md px-gutter-desktop">
      <p className="text-label-sm uppercase tracking-wider text-muted">Phase 0 — Foundation</p>
      <h1 className="text-headline-xl">MoveApp Kenya</h1>
      <p className="max-w-xl text-body-lg text-muted">
        Design tokens, database schema, and the shared component set are in place. The landing page
        arrives in Phase 2.
      </p>
      <Link
        href="/kitchen-sink"
        className="inline-flex h-12 items-center rounded-xl bg-brand px-space-lg text-label-md font-semibold text-ink transition-colors hover:bg-brand-hover"
      >
        Open the kitchen sink
      </Link>
    </main>
  );
}
