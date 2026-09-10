import { requireRole } from "@/lib/auth";

/** Every /dashboard route is owner-only; the guard lives here once. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("OWNER");
  return children;
}
