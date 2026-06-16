import type { UserRole } from "@prisma/client";
import type { OwnerUser } from "@/lib/crm-data";
import type {
  Account,
  ActivityType,
  Contact,
  CrmData,
  CrmObject,
  Lead,
  Opportunity,
  ViewName
} from "@/lib/types";

export type RecordMode = "create" | "edit" | "clone";
export type ModalState = { object: CrmObject; mode: RecordMode; id?: string } | null;
export type DeleteState = { object: CrmObject | "activity"; id: string; label: string } | null;
export type ActivityModalState = {
  mode: "create" | "edit";
  relatedType?: CrmObject;
  relatedId?: string;
  type?: ActivityType;
  id?: string;
} | null;
export type ConvertModalState = { leadId: string } | null;
export type SortState = { key: string; direction: "asc" | "desc" };
export type PersistableRecord = Account | Contact | Lead | Opportunity;
export type RecordItem = PersistableRecord;
export type CrmPermissions = { canWrite: boolean; canDelete: boolean; canTransferOwner: boolean };
export type CurrentUser = { id: string; name: string; role: UserRole; roleLabel: string };
export type ConvertLeadValues = {
  leadId: string;
  accountMode: "new" | "existing";
  accountId: string;
  accountName: string;
  createOpportunity: boolean;
  opportunityName: string;
  amount: string;
  closeDate: string;
};
export type ConvertLeadResult = { lead: Lead; account: Account; contact: Contact; opportunity: Opportunity | null };

export type Actions = {
  openCreate: (object: CrmObject) => void;
  openEdit: (object: CrmObject, id: string) => void;
  openClone: (object: CrmObject, id: string) => void;
  openDelete: (object: CrmObject | "activity", id: string, label: string) => void;
  openActivity: (relatedType: CrmObject, relatedId: string, type: ActivityType) => void;
  openCreateActivity: () => void;
  openEditActivity: (id: string) => void;
  openConvertLead: (leadId: string) => void;
};

export type FieldDef = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  full?: boolean;
  disabled?: boolean;
  help?: string;
  options: { value: string; label: string }[];
};

export type CrmWorkspaceProps = {
  view: ViewName;
  recordId?: string;
  initialData?: CrmData;
  databaseEnabled?: boolean;
  permissions?: CrmPermissions;
  currentUser?: CurrentUser;
  ownerUsers?: OwnerUser[];
};

export const objectMeta = {
  lead: { singular: "Lead", plural: "Leads", listPath: "/app/leads", test: "lead" },
  account: { singular: "Account", plural: "Accounts", listPath: "/app/accounts", test: "account" },
  contact: { singular: "Contact", plural: "Contacts", listPath: "/app/contacts", test: "contact" },
  opportunity: { singular: "Opportunity", plural: "Opportunities", listPath: "/app/opportunities", test: "opportunity" }
} as const;
