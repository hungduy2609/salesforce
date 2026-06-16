"use client";

import type { CrmData } from "@/lib/types";
import type { Actions, CrmPermissions } from "../workspace/types";
import { ObjectRecordsView } from "./ObjectRecordsView";

export function ContactsView({ recordId, data, actions, permissions }: { recordId?: string; data: CrmData; actions: Actions; permissions: CrmPermissions }) {
  return <ObjectRecordsView object="contact" recordId={recordId} data={data} actions={actions} permissions={permissions} />;
}
