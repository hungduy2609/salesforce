import { getCrmData, getOwnerUsers, isDatabaseConfigured } from "@/lib/crm-data";
import { can, requireUser, roleLabels } from "@/lib/auth";
import type { ViewName } from "@/lib/types";
import { CrmWorkspace } from "./CrmWorkspace";

export async function CrmWorkspaceShell({ view, recordId }: { view: ViewName; recordId?: string }) {
  const user = await requireUser();
  const data = await getCrmData();
  const ownerUsers = await getOwnerUsers(user);

  return (
    <CrmWorkspace
      view={view}
      recordId={recordId}
      initialData={data}
      databaseEnabled={isDatabaseConfigured()}
      currentUser={{ id: user.id, name: user.name, role: user.role, roleLabel: roleLabels[user.role] }}
      ownerUsers={ownerUsers}
      permissions={{ canWrite: can(user.role, "write"), canDelete: can(user.role, "delete"), canTransferOwner: can(user.role, "delete") }}
    />
  );
}
