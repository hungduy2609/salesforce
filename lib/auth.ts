import "server-only";

import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { UserRole, type User } from "@prisma/client";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "sf_session";
const SESSION_DAYS = 7;
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";

export type AuthUser = Pick<User, "id" | "email" | "name" | "initials" | "role">;
export type CrmPermission = "write" | "delete";

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMINISTRATOR]: "System Administrator",
  [UserRole.SALES_MANAGER]: "Sales Manager",
  [UserRole.SALES_REP]: "Sales Rep",
  [UserRole.READ_ONLY]: "Read Only"
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST).toString("hex");
  return `pbkdf2:${PASSWORD_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, iterationsValue, salt, hash] = storedHash.split(":");

  if (scheme !== "pbkdf2" || !iterationsValue || !salt || !hash) {
    return false;
  }

  const iterations = Number(iterationsValue);
  const candidate = pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST);
  const expected = Buffer.from(hash, "hex");

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt
    }
  });

  return { token, expiresAt };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return getUserBySessionToken(token);
}

export async function getUserBySessionToken(token: string): Promise<AuthUser | null> {
  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.userSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }

    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    initials: session.user.initials,
    role: session.user.role
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireCrmPermission(permission: CrmPermission) {
  const user = await getCurrentUser();

  if (!user) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  if (!can(user.role, permission)) {
    return { response: NextResponse.json({ error: "Insufficient role permissions" }, { status: 403 }) };
  }

  return { user };
}

export async function destroyCurrentSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.userSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function can(role: UserRole, permission: CrmPermission) {
  if (role === UserRole.SYSTEM_ADMINISTRATOR || role === UserRole.SALES_MANAGER) {
    return true;
  }

  if (role === UserRole.SALES_REP) {
    return permission === "write";
  }

  return false;
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
