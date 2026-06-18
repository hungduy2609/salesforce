import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return <CrmWorkspaceShell view="lead-detail" recordId={params.id} />;
}
