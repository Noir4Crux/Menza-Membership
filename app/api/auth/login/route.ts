import { NextResponse } from "next/server";
import { akunDemo } from "@/lib/akun-demo";
import { prisma } from "@/lib/prisma";
import { createSession, sessionRoles, type SessionRole } from "@/lib/session";

const redirects: Record<SessionRole, string> = {
  member: "/member/dashboard",
  administrator: "/admin/dashboard",
  barber: "/barber/dashboard",
  owner: "/owner/dashboard",
  supplier: "/supplier/dashboard",
};

function isSessionRole(value: unknown): value is SessionRole {
  return (
    typeof value === "string" &&
    sessionRoles.includes(value as SessionRole)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function invalidCredentials() {
  return NextResponse.json(
    { error: "Email/ID atau password salah" },
    { status: 401 },
  );
}

function wrongRole() {
  return NextResponse.json(
    { error: "Akun ini bukan untuk role tersebut" },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidCredentials();
  }

  if (
    !isRecord(body) ||
    !isSessionRole(body.role) ||
    typeof body.identifier !== "string" ||
    body.identifier.length === 0 ||
    typeof body.password !== "string"
  ) {
    return invalidCredentials();
  }

  const { role } = body;
  let id = body.identifier;
  let isDemoAccount = false;

  if (id.includes("@")) {
    const account = akunDemo[id.toLowerCase()];
    if (!account) {
      return invalidCredentials();
    }
    if (account.role !== role) {
      return wrongRole();
    }
    id = account.id;
    isDemoAccount = true;
  }

  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error("DEMO_PASSWORD must be configured to enable login.");
  }
  if (body.password !== demoPassword) {
    return invalidCredentials();
  }

  let idExists = isDemoAccount;

  if (!isDemoAccount) {
    switch (role) {
      case "member":
        idExists =
          (await prisma.member.findUnique({
            where: { MemberID: id },
            select: { MemberID: true },
          })) !== null;
        break;
      case "administrator":
        idExists =
          (await prisma.admin.findUnique({
            where: { AdminID: id },
            select: { AdminID: true },
          })) !== null;
        break;
      case "barber":
        idExists =
          (await prisma.barber.findUnique({
            where: { BarberID: id },
            select: { BarberID: true },
          })) !== null;
        break;
      case "owner":
        idExists =
          (await prisma.owner.findUnique({
            where: { OwnerID: id },
            select: { OwnerID: true },
          })) !== null;
        break;
      case "supplier":
        idExists = id.startsWith("SUP");
        break;
    }
  }

  if (!idExists) {
    return invalidCredentials();
  }

  await createSession({ role, id });
  return NextResponse.json({ redirect: redirects[role] });
}
