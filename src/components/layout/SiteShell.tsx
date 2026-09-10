import { Footer } from "@/components/layout/Footer";
import { TopBar } from "@/components/layout/TopBar";

/** Top bar, page, footer — the frame every tenant-facing screen sits in. */
export function SiteShell({
  children,
  searchSlot,
}: {
  children: React.ReactNode;
  searchSlot?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar searchSlot={searchSlot} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
