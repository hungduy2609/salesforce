import {
  ActivityStatus as DbActivityStatus,
  ActivityType as DbActivityType,
  ContactStatus as DbContactStatus,
  CrmObject as DbCrmObject,
  LeadStatus as DbLeadStatus,
  OpportunityStage as DbOpportunityStage,
  type Account as DbAccount,
  type Activity as DbActivity,
  type Contact as DbContact,
  type Lead as DbLead,
  type Opportunity as DbOpportunity
} from "@prisma/client";
import { seedData } from "./seed";
import type { AuthUser } from "./auth";
import type {
  Account,
  Activity,
  Contact,
  CrmData,
  CrmObject,
  Lead,
  Opportunity
} from "./types";

export type OwnerUser = { id: string; name: string; roleLabel: string };

const crmObjectMap: Record<DbCrmObject, CrmObject> = {
  [DbCrmObject.LEAD]: "lead",
  [DbCrmObject.ACCOUNT]: "account",
  [DbCrmObject.CONTACT]: "contact",
  [DbCrmObject.OPPORTUNITY]: "opportunity"
};

const leadStatusMap = {
  [DbLeadStatus.NEW]: "New",
  [DbLeadStatus.WORKING]: "Working",
  [DbLeadStatus.QUALIFIED]: "Qualified",
  [DbLeadStatus.CONVERTED]: "Converted",
  [DbLeadStatus.LOST]: "Lost"
} as const;

const contactStatusMap = {
  [DbContactStatus.ACTIVE]: "Active",
  [DbContactStatus.INACTIVE]: "Inactive"
} as const;

const opportunityStageMap = {
  [DbOpportunityStage.PROSPECTING]: "Prospecting",
  [DbOpportunityStage.QUALIFICATION]: "Qualification",
  [DbOpportunityStage.PROPOSAL]: "Proposal",
  [DbOpportunityStage.NEGOTIATION]: "Negotiation",
  [DbOpportunityStage.CLOSED_WON]: "Closed Won",
  [DbOpportunityStage.CLOSED_LOST]: "Closed Lost"
} as const;

const activityTypeMap = {
  [DbActivityType.CALL]: "Call",
  [DbActivityType.TASK]: "Task",
  [DbActivityType.NOTE]: "Note",
  [DbActivityType.EMAIL]: "Email"
} as const;

const activityStatusMap = {
  [DbActivityStatus.OPEN]: "Open",
  [DbActivityStatus.COMPLETED]: "Completed"
} as const;

export async function getCrmData(): Promise<CrmData> {
  if (!isDatabaseConfigured()) {
    return structuredClone(seedData);
  }

  try {
    const { prisma } = await import("./prisma");
    const [accounts, contacts, leads, opportunities, activities] = await Promise.all([
      prisma.account.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.contact.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.lead.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.opportunity.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.activity.findMany({ orderBy: { createdAt: "asc" } })
    ]);

    return {
      accounts: accounts.map(mapAccount),
      contacts: contacts.map(mapContact),
      leads: leads.map(mapLead),
      opportunities: opportunities.map(mapOpportunity),
      activities: activities.map(mapActivity)
    };
  } catch (error) {
    console.error("Failed to load CRM data from Prisma", error);
    return structuredClone(seedData);
  }
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getOwnerUsers(currentUser: AuthUser): Promise<OwnerUser[]> {
  if (!isDatabaseConfigured()) {
    const names = new Set([
      currentUser.name,
      ...seedData.accounts.map((record) => record.owner),
      ...seedData.contacts.map((record) => record.owner),
      ...seedData.leads.map((record) => record.owner),
      ...seedData.opportunities.map((record) => record.owner),
      ...seedData.activities.map((record) => record.createdBy)
    ].filter(Boolean));

    return [...names].map((name) => ({ id: name, name, roleLabel: name === currentUser.name ? "Current User" : "Demo User" }));
  }

  try {
    const { prisma } = await import("./prisma");
    const { roleLabels } = await import("./auth");
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    return users.map((user) => ({ id: user.id, name: user.name, roleLabel: roleLabels[user.role] }));
  } catch (error) {
    console.error("Failed to load owner users from Prisma", error);
    return [{ id: currentUser.id, name: currentUser.name, roleLabel: "Current User" }];
  }
}

function mapAccount(account: DbAccount): Account {
  return {
    ...account,
    createdAt: formatDate(account.createdAt),
    updatedAt: formatDate(account.updatedAt)
  };
}

function mapContact(contact: DbContact): Contact {
  return {
    ...contact,
    status: contactStatusMap[contact.status],
    createdAt: formatDate(contact.createdAt),
    updatedAt: formatDate(contact.updatedAt)
  };
}

function mapLead(lead: DbLead): Lead {
  return {
    ...lead,
    status: leadStatusMap[lead.status],
    createdAt: formatDate(lead.createdAt),
    updatedAt: formatDate(lead.updatedAt)
  };
}

function mapOpportunity(opportunity: DbOpportunity): Opportunity {
  return {
    ...opportunity,
    contactId: opportunity.contactId ?? undefined,
    stage: opportunityStageMap[opportunity.stage],
    closeDate: formatDate(opportunity.closeDate),
    createdAt: formatDate(opportunity.createdAt),
    updatedAt: formatDate(opportunity.updatedAt)
  };
}

function mapActivity(activity: DbActivity): Activity {
  return {
    ...activity,
    relatedType: crmObjectMap[activity.relatedType],
    type: activityTypeMap[activity.type],
    status: activityStatusMap[activity.status],
    dueDate: formatDate(activity.dueDate),
    createdAt: formatDate(activity.createdAt)
  };
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
