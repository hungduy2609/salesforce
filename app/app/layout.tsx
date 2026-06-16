import { AppShell } from "@/components/app-shell/AppShell";
import { requireUser, roleLabels } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return <AppShell user={{ ...user, roleLabel: roleLabels[user.role] }}>{children}</AppShell>;
}
