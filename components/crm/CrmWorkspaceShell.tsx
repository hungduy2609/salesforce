import type { ViewName } from "@/lib/types";
import { CrmWorkspace } from "./CrmWorkspace";

export function CrmWorkspaceShell({ view, recordId }: { view: ViewName; recordId?: string }) {
  return <CrmWorkspace view={view} recordId={recordId} />;
}
