import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const sessionRoles = [
  "member",
  "administrator",
  "barber",
  "owner",
  "supplier",
] as const;

export type SessionRole = (typeof sessionRoles)[number];

export type Session = {
  role: SessionRole;
  id: string;
};

const COOKIE_NAME = "menza_session";
const SESSION_MAX_AGE = 8 * 60 * 60;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be configured to use sessions.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export async function createSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const value = `${payload}.${sign(payload)}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) {
    return null;
  }

  const separator = value.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expectedSignature = Buffer.from(sign(payload), "base64url");
  const receivedSignature = Buffer.from(signature, "base64url");

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("role" in parsed) ||
      !sessionRoles.includes(parsed.role as SessionRole) ||
      !("id" in parsed) ||
      typeof parsed.id !== "string" ||
      parsed.id.length === 0
    ) {
      return null;
    }

    return { role: parsed.role as SessionRole, id: parsed.id };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireRole(
  role: SessionRole,
): Promise<Session | NextResponse> {
  const session = await getSession();
  if (!session || session.role !== role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
