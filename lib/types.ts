export type CrmObject = "lead" | "account" | "contact" | "opportunity";

export type LeadStatus = "New" | "Working" | "Qualified" | "Converted" | "Lost";
export type ContactStatus = "Active" | "Inactive";
export type OpportunityStage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";
export type ActivityType = "Call" | "Task" | "Note" | "Email";
export type ActivityStatus = "Open" | "Completed";

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  accountId: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  status: ContactStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  contactId?: string;
  amount: number;
  stage: OpportunityStage;
  closeDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  relatedType: CrmObject;
  relatedId: string;
  type: ActivityType;
  subject: string;
  description: string;
  dueDate: string;
  status: ActivityStatus;
  createdBy: string;
  createdAt: string;
}

export interface CrmData {
  accounts: Account[];
  contacts: Contact[];
  leads: Lead[];
  opportunities: Opportunity[];
  activities: Activity[];
}

export type ViewName =
  | "home"
  | "leads"
  | "lead-detail"
  | "accounts"
  | "account-detail"
  | "contacts"
  | "contact-detail"
  | "opportunities"
  | "opportunity-detail"
  | "opportunity-kanban"
  | "activities"
  | "reports";
