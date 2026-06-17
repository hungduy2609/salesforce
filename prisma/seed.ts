import {
  ActivityStatus as DbActivityStatus,
  ActivityType as DbActivityType,
  ContactStatus as DbContactStatus,
  CrmObject as DbCrmObject,
  LeadStatus as DbLeadStatus,
  OpportunityStage as DbOpportunityStage,
  PrismaClient,
  UserRole as DbUserRole
} from "@prisma/client";
import { pbkdf2Sync, randomBytes } from "crypto";
import { seedData } from "../lib/seed";
import type {
  ActivityStatus,
  ActivityType,
  ContactStatus,
  CrmObject,
  LeadStatus,
  OpportunityStage
} from "../lib/types";

const prisma = new PrismaClient();
const demoPassword = "demo-password";
const demoUsers = [
  { email: "duy@example.com", name: "Duy Le", initials: "DU", role: DbUserRole.SALES_REP },
  { email: "manager@example.com", name: "Mai Tran", initials: "MT", role: DbUserRole.SALES_MANAGER },
  { email: "admin@example.com", name: "Admin User", initials: "AD", role: DbUserRole.SYSTEM_ADMINISTRATOR },
  { email: "readonly@example.com", name: "Read Only", initials: "RO", role: DbUserRole.READ_ONLY }
];

const crmObjectMap: Record<CrmObject, DbCrmObject> = {
  lead: DbCrmObject.LEAD,
  account: DbCrmObject.ACCOUNT,
  contact: DbCrmObject.CONTACT,
  opportunity: DbCrmObject.OPPORTUNITY
};

const leadStatusMap: Record<LeadStatus, DbLeadStatus> = {
  New: DbLeadStatus.NEW,
  Working: DbLeadStatus.WORKING,
  Qualified: DbLeadStatus.QUALIFIED,
  Converted: DbLeadStatus.CONVERTED,
  Lost: DbLeadStatus.LOST
};

const contactStatusMap: Record<ContactStatus, DbContactStatus> = {
  Active: DbContactStatus.ACTIVE,
  Inactive: DbContactStatus.INACTIVE
};

const opportunityStageMap: Record<OpportunityStage, DbOpportunityStage> = {
  Prospecting: DbOpportunityStage.PROSPECTING,
  Qualification: DbOpportunityStage.QUALIFICATION,
  Proposal: DbOpportunityStage.PROPOSAL,
  Negotiation: DbOpportunityStage.NEGOTIATION,
  "Closed Won": DbOpportunityStage.CLOSED_WON,
  "Closed Lost": DbOpportunityStage.CLOSED_LOST
};

const activityTypeMap: Record<ActivityType, DbActivityType> = {
  Call: DbActivityType.CALL,
  Task: DbActivityType.TASK,
  Note: DbActivityType.NOTE,
  Email: DbActivityType.EMAIL
};

const activityStatusMap: Record<ActivityStatus, DbActivityStatus> = {
  Open: DbActivityStatus.OPEN,
  Completed: DbActivityStatus.COMPLETED
};

async function main() {
  await prisma.$transaction([
    prisma.userSession.deleteMany(),
    prisma.user.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.opportunity.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.account.deleteMany()
  ]);

  await prisma.account.createMany({
    data: seedData.accounts.map((account) => ({
      ...account,
      createdAt: toDate(account.createdAt),
      updatedAt: toDate(account.updatedAt)
    }))
  });

  await prisma.contact.createMany({
    data: seedData.contacts.map((contact) => ({
      ...contact,
      status: contactStatusMap[contact.status],
      createdAt: toDate(contact.createdAt),
      updatedAt: toDate(contact.updatedAt)
    }))
  });

  await prisma.lead.createMany({
    data: seedData.leads.map((lead) => ({
      ...lead,
      status: leadStatusMap[lead.status],
      createdAt: toDate(lead.createdAt),
      updatedAt: toDate(lead.updatedAt)
    }))
  });

  await prisma.opportunity.createMany({
    data: seedData.opportunities.map((opportunity) => ({
      ...opportunity,
      contactId: opportunity.contactId ?? null,
      stage: opportunityStageMap[opportunity.stage],
      closeDate: toDate(opportunity.closeDate),
      createdAt: toDate(opportunity.createdAt),
      updatedAt: toDate(opportunity.updatedAt)
    }))
  });

  await prisma.activity.createMany({
    data: seedData.activities.map((activity) => ({
      ...activity,
      relatedType: crmObjectMap[activity.relatedType],
      type: activityTypeMap[activity.type],
      status: activityStatusMap[activity.status],
      dueDate: toDate(activity.dueDate),
      createdAt: toDate(activity.createdAt)
    }))
  });

  await prisma.user.createMany({
    data: demoUsers.map((user) => ({
      ...user,
      passwordHash: hashPassword(demoPassword)
    }))
  });
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 210_000, 32, "sha256").toString("hex");
  return `pbkdf2:210000:${salt}:${hash}`;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
