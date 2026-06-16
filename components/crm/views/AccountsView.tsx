"use client";

import type { CrmData } from "@/lib/types";
import type { Actions, CrmPermissions } from "../workspace/types";
import { ObjectRecordsView } from "./ObjectRecordsView";

export function AccountsView({ recordId, data, actions, permissions }: { recordId?: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  return <ObjectRecordsView object="account" recordId={recordId} data={data} actions={actions} permissions={permissions} />;
}
