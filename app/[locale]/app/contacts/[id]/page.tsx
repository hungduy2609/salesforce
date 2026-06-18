import { CrmWorkspaceShell } from "@/components/crm/CrmWorkspaceShell";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return <CrmWorkspaceShell view="contact-detail" recordId={params.id} />;
}
