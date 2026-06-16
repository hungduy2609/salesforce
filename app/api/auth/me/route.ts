import { NextResponse } from "next/server";
import { getCurrentUser, roleLabels } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: { ...user, roleLabel: roleLabels[user.role] } });
}
