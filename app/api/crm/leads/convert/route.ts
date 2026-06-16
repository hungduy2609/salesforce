import { ContactStatus, LeadStatus, OpportunityStage } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireCrmPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ConvertLeadBody = {
  leadId?: string;
  accountMode?: "new" | "existing";
  accountId?: string;
  accountName?: string;
  createOpportunity?: boolean;
  opportunityName?: string;
  amount?: number;
  closeDate?: string;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const auth = await requireCrmPermission("write");
  if (auth.response) return auth.response;

  const body = (await request.json()) as ConvertLeadBody;

  if (!body.leadId) {
    return NextResponse.json({ error: "Lead is required" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: body.leadId } });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (lead.status === LeadStatus.CONVERTED) {
    return NextResponse.json({ error: "Lead is already converted" }, { status: 409 });
  }

  if (body.accountMode === "existing" && !body.accountId) {
    return NextResponse.json({ error: "Existing account is required" }, { status: 400 });
  }

  if (body.accountMode !== "existing" && !body.accountName?.trim()) {
    return NextResponse.json({ error: "Account name is required" }, { status: 400 });
  }

  if (body.createOpportunity && !body.opportunityName?.trim()) {
    return NextResponse.json({ error: "Opportunity name is required" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = body.accountMode === "existing"
      ? await tx.account.findUniqueOrThrow({ where: { id: body.accountId } })
      : await tx.account.create({
          data: {
            name: body.accountName?.trim() || lead.company,
            industry: "Converted Lead",
            website: "",
            phone: lead.phone,
            owner: lead.owner
          }
        });

    const contact = await tx.contact.upsert({
      where: { email: lead.email },
      update: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        accountId: account.id,
        title: lead.title,
        phone: lead.phone,
        owner: lead.owner,
        status: ContactStatus.ACTIVE
      },
      create: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        accountId: account.id,
        title: lead.title,
        department: "",
        email: lead.email,
        phone: lead.phone,
        mobile: "",
        status: ContactStatus.ACTIVE,
        owner: lead.owner
      }
    });

    const opportunity = body.createOpportunity
      ? await tx.opportunity.create({
          data: {
            name: body.opportunityName?.trim() || `${lead.company} Opportunity`,
            accountId: account.id,
            contactId: contact.id,
            amount: Number(body.amount ?? 0),
            stage: OpportunityStage.PROSPECTING,
            closeDate: body.closeDate ? toDate(body.closeDate) : new Date(),
            owner: lead.owner
          }
        })
      : null;

    const convertedLead = await tx.lead.update({
      where: { id: lead.id },
      data: { status: LeadStatus.CONVERTED }
    });

    return { account, contact, opportunity, lead: convertedLead };
  });

  return NextResponse.json({
    lead: {
      ...result.lead,
      status: "Converted",
      createdAt: formatDate(result.lead.createdAt),
      updatedAt: formatDate(result.lead.updatedAt)
    },
    account: {
      ...result.account,
      createdAt: formatDate(result.account.createdAt),
      updatedAt: formatDate(result.account.updatedAt)
    },
    contact: {
      ...result.contact,
      status: "Active",
      createdAt: formatDate(result.contact.createdAt),
      updatedAt: formatDate(result.contact.updatedAt)
    },
    opportunity: result.opportunity
      ? {
          ...result.opportunity,
          contactId: result.opportunity.contactId ?? undefined,
          stage: "Prospecting",
          closeDate: formatDate(result.opportunity.closeDate),
          createdAt: formatDate(result.opportunity.createdAt),
          updatedAt: formatDate(result.opportunity.updatedAt)
        }
      : null
  });
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
