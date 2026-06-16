import {
  ContactStatus as DbContactStatus,
  LeadStatus as DbLeadStatus,
  OpportunityStage as DbOpportunityStage
} from "@prisma/client";
import { NextResponse } from "next/server";
import { requireCrmPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Account, Contact, CrmObject, Lead, Opportunity } from "@/lib/types";

export const runtime = "nodejs";

const leadStatusMap: Record<Lead["status"], DbLeadStatus> = {
  New: DbLeadStatus.NEW,
  Working: DbLeadStatus.WORKING,
  Qualified: DbLeadStatus.QUALIFIED,
  Converted: DbLeadStatus.CONVERTED,
  Lost: DbLeadStatus.LOST
};

const contactStatusMap: Record<Contact["status"], DbContactStatus> = {
  Active: DbContactStatus.ACTIVE,
  Inactive: DbContactStatus.INACTIVE
};

const opportunityStageMap: Record<Opportunity["stage"], DbOpportunityStage> = {
  Prospecting: DbOpportunityStage.PROSPECTING,
  Qualification: DbOpportunityStage.QUALIFICATION,
  Proposal: DbOpportunityStage.PROPOSAL,
  Negotiation: DbOpportunityStage.NEGOTIATION,
  "Closed Won": DbOpportunityStage.CLOSED_WON,
  "Closed Lost": DbOpportunityStage.CLOSED_LOST
};

const activityObjectMap = {
  lead: "LEAD",
  account: "ACCOUNT",
  contact: "CONTACT",
  opportunity: "OPPORTUNITY"
} as const;

type SaveBody =
  | { object: "account"; record: Account }
  | { object: "contact"; record: Contact }
  | { object: "lead"; record: Lead }
  | { object: "opportunity"; record: Opportunity };

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const auth = await requireCrmPermission("write");
  if (auth.response) return auth.response;

  const body = (await request.json()) as SaveBody;

  if (body.object === "account") {
    const account = body.record;
    await prisma.account.upsert({
      where: { id: account.id },
      update: {
        name: account.name,
        industry: account.industry,
        website: account.website,
        phone: account.phone,
        owner: account.owner,
        createdAt: toDate(account.createdAt),
        updatedAt: toDate(account.updatedAt)
      },
      create: {
        ...account,
        createdAt: toDate(account.createdAt),
        updatedAt: toDate(account.updatedAt)
      }
    });
  }

  if (body.object === "contact") {
    const contact = body.record;
    await prisma.contact.upsert({
      where: { id: contact.id },
      update: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        accountId: contact.accountId,
        title: contact.title,
        department: contact.department,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        status: contactStatusMap[contact.status],
        owner: contact.owner,
        createdAt: toDate(contact.createdAt),
        updatedAt: toDate(contact.updatedAt)
      },
      create: {
        ...contact,
        status: contactStatusMap[contact.status],
        createdAt: toDate(contact.createdAt),
        updatedAt: toDate(contact.updatedAt)
      }
    });
  }

  if (body.object === "lead") {
    const lead = body.record;
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        title: lead.title,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: leadStatusMap[lead.status],
        owner: lead.owner,
        createdAt: toDate(lead.createdAt),
        updatedAt: toDate(lead.updatedAt)
      },
      create: {
        ...lead,
        status: leadStatusMap[lead.status],
        createdAt: toDate(lead.createdAt),
        updatedAt: toDate(lead.updatedAt)
      }
    });
  }

  if (body.object === "opportunity") {
    const opportunity = body.record;
    await prisma.opportunity.upsert({
      where: { id: opportunity.id },
      update: {
        name: opportunity.name,
        accountId: opportunity.accountId,
        contactId: opportunity.contactId ?? null,
        amount: opportunity.amount,
        stage: opportunityStageMap[opportunity.stage],
        closeDate: toDate(opportunity.closeDate),
        owner: opportunity.owner,
        createdAt: toDate(opportunity.createdAt),
        updatedAt: toDate(opportunity.updatedAt)
      },
      create: {
        ...opportunity,
        contactId: opportunity.contactId ?? null,
        stage: opportunityStageMap[opportunity.stage],
        closeDate: toDate(opportunity.closeDate),
        createdAt: toDate(opportunity.createdAt),
        updatedAt: toDate(opportunity.updatedAt)
      }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const auth = await requireCrmPermission("delete");
  if (auth.response) return auth.response;

  const { object, id } = (await request.json()) as { object: CrmObject | "activity"; id: string };

  if (object === "activity") {
    await prisma.activity.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.activity.deleteMany({ where: { relatedType: activityObjectMap[object], relatedId: id } });

  if (object === "account") await prisma.account.delete({ where: { id } });
  if (object === "contact") await prisma.contact.delete({ where: { id } });
  if (object === "lead") await prisma.lead.delete({ where: { id } });
  if (object === "opportunity") await prisma.opportunity.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
