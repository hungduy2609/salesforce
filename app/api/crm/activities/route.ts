import {
  ActivityStatus as DbActivityStatus,
  ActivityType as DbActivityType,
  CrmObject as DbCrmObject
} from "@prisma/client";
import { NextResponse } from "next/server";
import { requireCrmPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Activity } from "@/lib/types";

export const runtime = "nodejs";

const crmObjectMap: Record<Activity["relatedType"], DbCrmObject> = {
  lead: DbCrmObject.LEAD,
  account: DbCrmObject.ACCOUNT,
  contact: DbCrmObject.CONTACT,
  opportunity: DbCrmObject.OPPORTUNITY
};

const activityTypeMap: Record<Activity["type"], DbActivityType> = {
  Call: DbActivityType.CALL,
  Task: DbActivityType.TASK,
  Note: DbActivityType.NOTE,
  Email: DbActivityType.EMAIL
};

const activityStatusMap: Record<Activity["status"], DbActivityStatus> = {
  Open: DbActivityStatus.OPEN,
  Completed: DbActivityStatus.COMPLETED
};

export async function POST(request: Request) {
  return upsertActivity(request);
}

export async function PUT(request: Request) {
  return upsertActivity(request);
}

async function upsertActivity(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const auth = await requireCrmPermission("write");
  if (auth.response) return auth.response;

  const activity = (await request.json()) as Activity;

  await prisma.activity.upsert({
    where: { id: activity.id },
    update: {
      relatedType: crmObjectMap[activity.relatedType],
      relatedId: activity.relatedId,
      type: activityTypeMap[activity.type],
      subject: activity.subject,
      description: activity.description,
      dueDate: toDate(activity.dueDate),
      status: activityStatusMap[activity.status],
      createdBy: activity.createdBy,
      createdAt: toDate(activity.createdAt)
    },
    create: {
      id: activity.id,
      relatedType: crmObjectMap[activity.relatedType],
      relatedId: activity.relatedId,
      type: activityTypeMap[activity.type],
      subject: activity.subject,
      description: activity.description,
      dueDate: toDate(activity.dueDate),
      status: activityStatusMap[activity.status],
      createdBy: activity.createdBy,
      createdAt: toDate(activity.createdAt)
    }
  });

  return NextResponse.json({ ok: true });
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
