import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  return <CrmWorkspaceShell view="opportunity-detail" recordId={params.id} />;
}
