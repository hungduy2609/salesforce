import { AppShell } from "@/components/app-shell/AppShell";
import { CrmStateProvider } from "@/components/crm/CrmStateProvider";
import { requireUser, roleLabels, can } from "@/lib/auth";
import { getCrmData, getOwnerUsers, isDatabaseConfigured } from "@/lib/crm-data";

export const dynamic = "force-dynamic";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [data, ownerUsers] = await Promise.all([getCrmData(), getOwnerUsers(user)]);
  const appShellUser = { ...user, roleLabel: roleLabels[user.role] };
  const currentUser = { id: user.id, name: user.name, role: user.role, roleLabel: roleLabels[user.role] };
  const permissions = {
    canWrite: can(user.role, "write"),
    canDelete: can(user.role, "delete"),
    canTransferOwner: can(user.role, "delete")
  };

  return (
    <AppShell user={appShellUser}>
      <CrmStateProvider
        initialData={data}
        databaseEnabled={isDatabaseConfigured()}
        permissions={permissions}
        currentUser={currentUser}
        ownerUsers={ownerUsers}
      >
        {children}
      </CrmStateProvider>
    </AppShell>
  );
}
