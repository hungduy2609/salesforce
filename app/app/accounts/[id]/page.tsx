import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function AccountDetailPage({ params }: { params: { id: string } }) {
  return <CrmWorkspaceShell view="account-detail" recordId={params.id} />;
}
