import { requireRole } from "@/lib/auth";

/** Every /admin route is admin-only; the guard lives here once. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return children;
}
